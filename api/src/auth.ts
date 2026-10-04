import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { b64url, b64urlDecode, pkceChallenge, randomToken, sha256hex, sign, verify } from './crypto';
import type { AppEnv, SessionUser } from './types';

const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const OAUTH_TTL_MS = 10 * 60 * 1000;

const sessionCookie: CookieOptions = { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: SESSION_MS / 1000 };
const oauthCookie: CookieOptions = { path: '/auth', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: OAUTH_TTL_MS / 1000 };

export const allowedOrigins = (env: Env) => env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);

/** `return` must point back at the study site; anything else falls back to APP_URL (no open redirects). */
export function safeReturn(raw: string | undefined, env: Env): string {
  if (!raw) return env.APP_URL;
  try {
    const u = new URL(raw);
    return allowedOrigins(env).includes(u.origin) ? u.toString() : env.APP_URL;
  } catch {
    return env.APP_URL;
  }
}

const withParam = (url: string, key: string, value: string) => {
  const u = new URL(url);
  u.searchParams.set(key, value);
  return u.toString();
};

const callbackUrl = (c: Context<AppEnv>) => new URL('/auth/github/callback', c.req.url).toString();

// ───────── sessions ─────────

export async function startSession(c: Context<AppEnv>, userId: number) {
  const token = randomToken(32);
  const now = Date.now();
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < ?').bind(userId, now),
    c.env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256hex(token), userId, now, now + SESSION_MS),
  ]);
  setCookie(c, 'sid', token, sessionCookie);
}

/** The signed-in user, or null. Renews the session when less than half its lifetime is left. */
export async function currentUser(c: Context<AppEnv>): Promise<SessionUser | null> {
  const token = getCookie(c, 'sid');
  if (!token) return null;
  const hash = await sha256hex(token);
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.login, u.name, u.avatar_url, u.seq, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`,
  ).bind(hash).first<{ id: number; login: string; name: string | null; avatar_url: string | null; seq: number; expires_at: number }>();
  const now = Date.now();
  if (!row || row.expires_at <= now) return null;
  if (row.expires_at - now < SESSION_MS / 2) {
    await c.env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(now + SESSION_MS, hash).run();
    setCookie(c, 'sid', token, sessionCookie);
  }
  return { id: row.id, login: row.login, name: row.name, avatarUrl: row.avatar_url, seq: row.seq };
}

export async function endSession(c: Context<AppEnv>) {
  const token = getCookie(c, 'sid');
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256hex(token)).run();
  deleteCookie(c, 'sid', { path: '/', secure: true });
}

async function upsertUser(db: D1Database, gh: { id: number; login: string; name: string | null; avatar_url: string | null }) {
  const id = await db.prepare(
    `INSERT INTO users (github_id, login, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (github_id) DO UPDATE SET login = excluded.login, name = excluded.name, avatar_url = excluded.avatar_url
     RETURNING id`,
  ).bind(gh.id, gh.login, gh.name, gh.avatar_url, Date.now()).first<number>('id');
  if (id === null) throw new Error('user upsert failed');
  return id;
}

// ───────── GitHub OAuth (web flow + PKCE, no scopes: public profile only) ─────────

export async function githubStart(c: Context<AppEnv>) {
  const ret = safeReturn(c.req.query('return'), c.env);
  const state = randomToken(16);
  const verifier = randomToken(32);
  const payload = b64url(JSON.stringify({ s: state, v: verifier, r: ret, e: Date.now() + OAUTH_TTL_MS }));
  setCookie(c, 'oauth', `${payload}.${await sign(c.env.SESSION_SECRET, payload)}`, oauthCookie);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', c.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackUrl(c));
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', await pkceChallenge(verifier));
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('allow_signup', 'true');
  return c.redirect(url.toString(), 302);
}

export async function githubCallback(c: Context<AppEnv>) {
  const raw = getCookie(c, 'oauth');
  deleteCookie(c, 'oauth', { path: '/auth', secure: true });
  const fail = (why: string, ret = c.env.APP_URL) => {
    console.warn(`sign-in failed: ${why}`);
    return c.redirect(withParam(ret, 'signin', 'error'), 302);
  };

  if (!raw) return fail('missing oauth cookie');
  const [payload, sig] = raw.split('.');
  if (!payload || !sig || !(await verify(c.env.SESSION_SECRET, payload, sig))) return fail('bad oauth cookie');
  const flow = JSON.parse(b64urlDecode(payload)) as { s: string; v: string; r: string; e: number };
  if (flow.e < Date.now()) return fail('sign-in took too long', flow.r);
  if (c.req.query('error')) return fail(`github: ${c.req.query('error')}`, flow.r);
  if (c.req.query('state') !== flow.s) return fail('state mismatch', flow.r);
  const code = c.req.query('code');
  if (!code) return fail('no code', flow.r);

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(c),
      code_verifier: flow.v,
    }),
  });
  const tok = (await tokenRes.json().catch(() => ({}))) as { access_token?: string; error?: string };
  if (!tok.access_token) return fail(`token exchange: ${tok.error ?? tokenRes.status}`, flow.r);

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tok.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'dsa-mastery-api' },
  });
  if (!userRes.ok) return fail(`user fetch: ${userRes.status}`, flow.r);
  const gh = (await userRes.json()) as { id: number; login: string; name: string | null; avatar_url: string | null };
  // The GitHub access token is not stored anywhere: we only needed it to learn who this is.

  await startSession(c, await upsertUser(c.env.DB, gh));
  return c.redirect(withParam(flow.r, 'signin', 'ok'), 302);
}

/** Local end-to-end tests only: enabled solely when DEV_LOGIN=true (api/.dev.vars). */
export async function devLogin(c: Context<AppEnv>) {
  if (c.env.DEV_LOGIN !== 'true') return c.json({ error: 'not found' }, 404);
  const body = (await c.req.json().catch(() => ({}))) as { login?: string };
  const login = (body.login ?? 'dev-user').replace(/[^a-z0-9-]/gi, '').slice(0, 39) || 'dev-user';
  let h = 0;
  for (const ch of login) h = (h * 31 + ch.charCodeAt(0)) % 1_000_000_007;
  const id = await upsertUser(c.env.DB, { id: -(h + 1), login, name: `Dev ${login}`, avatar_url: null });
  await startSession(c, id);
  return c.json({ ok: true, login });
}
