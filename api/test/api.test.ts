import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';
import { sha256hex } from '../src/crypto';

const SITE = 'https://dsa.jayantkapoor.com';
const API = 'https://api.jayantkapoor.com';

async function call(path: string, init: RequestInit & { cookie?: string } = {}, envOverride: Partial<Env> = {}) {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set('Cookie', init.cookie);
  const ctx = createExecutionContext();
  const res = await app.fetch(new Request(API + path, { ...init, headers, redirect: 'manual' }), { ...env, ...envOverride }, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

const json = (body: unknown, cookie?: string): RequestInit & { cookie?: string } => ({
  method: 'POST',
  headers: { Origin: SITE, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  cookie,
});

const cookieValue = (res: Response, name: string) =>
  res.headers.getSetCookie().map((c) => c.split(';')[0]).find((c) => c.startsWith(`${name}=`));

async function login(name = 'alice') {
  const res = await call('/auth/dev-login', json({ login: name }));
  expect(res.status).toBe(200);
  return cookieValue(res, 'sid')!;
}

const T = 1_791_000_000_000; // a fixed "now"-ish timestamp for ops
const op = (kind: string, key: string, value: unknown, updatedAt = T, deleted?: boolean) => ({ kind, key, value, updatedAt, ...(deleted ? { deleted } : {}) });

afterEach(() => vi.restoreAllMocks());

describe('CORS and CSRF guard', () => {
  it('answers preflight only for the study site', async () => {
    const ok = await call('/sync', { method: 'OPTIONS', headers: { Origin: SITE } });
    expect(ok.status).toBe(204);
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(SITE);
    expect(ok.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    const bad = await call('/sync', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } });
    expect(bad.status).toBe(403);
  });

  it('rejects state changes from other origins or without JSON', async () => {
    const sid = await login();
    const evil = await call('/sync', { ...json({ since: 0, ops: [] }, sid), headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' } });
    expect(evil.status).toBe(403);
    const noOrigin = await call('/sync', { ...json({ since: 0, ops: [] }, sid), headers: { 'Content-Type': 'application/json' } });
    expect(noOrigin.status).toBe(403);
    const form = await call('/sync', { method: 'POST', headers: { Origin: SITE, 'Content-Type': 'text/plain' }, body: '{}', cookie: sid });
    expect(form.status).toBe(415);
  });
});

describe('sessions', () => {
  it('/me is 401 when signed out and returns the profile when signed in', async () => {
    expect((await call('/me', { headers: { Origin: SITE } })).status).toBe(401);
    const sid = await login('bob');
    const me = await call('/me', { headers: { Origin: SITE }, cookie: sid });
    expect(me.status).toBe(200);
    expect(((await me.json()) as { user: { login: string } }).user.login).toBe('bob');
    expect(me.headers.get('Access-Control-Allow-Origin')).toBe(SITE);
  });

  it('sets a hardened session cookie', async () => {
    const res = await call('/auth/dev-login', json({ login: 'carol' }));
    const header = res.headers.getSetCookie().find((c) => c.startsWith('sid='))!;
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/Secure/i);
    expect(header).toMatch(/SameSite=Lax/i);
    expect(header).toMatch(/Max-Age=2592000/);
  });

  it('dev login does not exist unless DEV_LOGIN=true', async () => {
    const res = await call('/auth/dev-login', json({ login: 'x' }), { DEV_LOGIN: undefined as unknown as string });
    expect(res.status).toBe(404);
  });

  it('expired sessions are rejected', async () => {
    const sid = await login('dave');
    const hash = await sha256hex(sid.slice(4));
    await env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(Date.now() - 1, hash).run();
    expect((await call('/me', { cookie: sid })).status).toBe(401);
  });

  it('renews a session that is past half its lifetime', async () => {
    const sid = await login('erin');
    const hash = await sha256hex(sid.slice(4));
    await env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(Date.now() + 1000 * 60 * 60, hash).run();
    const res = await call('/me', { cookie: sid });
    expect(res.status).toBe(200);
    expect(cookieValue(res, 'sid')).toBe(sid);
    const exp = await env.DB.prepare('SELECT expires_at FROM sessions WHERE token_hash = ?').bind(hash).first<number>('expires_at');
    expect(exp!).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 24 * 29);
  });

  it('logout ends the session', async () => {
    const sid = await login('frank');
    expect((await call('/auth/logout', json({}, sid))).status).toBe(200);
    expect((await call('/me', { cookie: sid })).status).toBe(401);
  });
});

describe('GitHub OAuth', () => {
  async function start(ret = `${SITE}/chapters/range-queries/`) {
    const res = await call(`/auth/github?return=${encodeURIComponent(ret)}`);
    expect(res.status).toBe(302);
    const to = new URL(res.headers.get('Location')!);
    return { to, oauth: cookieValue(res, 'oauth')! };
  }

  it('redirects to GitHub with PKCE and a state', async () => {
    const { to, oauth } = await start();
    expect(to.origin + to.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(to.searchParams.get('client_id')).toBe('test-client-id');
    expect(to.searchParams.get('code_challenge_method')).toBe('S256');
    expect(to.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);
    expect(to.searchParams.get('redirect_uri')).toBe(`${API}/auth/github/callback`);
    expect(to.searchParams.get('scope')).toBeNull();
    expect(oauth).toBeTruthy();
  });

  it('signs the user in after a successful callback and never stores the GitHub token', async () => {
    const { to, oauth } = await start();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.startsWith('https://github.com/login/oauth/access_token')) return Response.json({ access_token: 'gho_secret' });
      if (url === 'https://api.github.com/user') return Response.json({ id: 4242, login: 'jayant', name: 'Jayant Kapoor', avatar_url: 'https://avatars.example/1' });
      throw new Error(`unexpected fetch ${url}`);
    });
    const res = await call(`/auth/github/callback?code=abc&state=${to.searchParams.get('state')}`, { cookie: oauth });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const tokenBody = String((fetchSpy.mock.calls[0][1] as RequestInit).body);
    expect(tokenBody).toContain('code_verifier=');
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(`${SITE}/chapters/range-queries/?signin=ok`);
    const sid = cookieValue(res, 'sid')!;
    const me = (await (await call('/me', { cookie: sid })).json()) as { user: { login: string; name: string } };
    expect(me.user).toMatchObject({ login: 'jayant', name: 'Jayant Kapoor' });
    const dump = JSON.stringify(await env.DB.prepare('SELECT * FROM users').all());
    expect(dump).not.toContain('gho_secret');
  });

  it('rejects a mismatched state', async () => {
    const { oauth } = await start();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await call('/auth/github/callback?code=abc&state=wrong', { cookie: oauth });
    expect(res.headers.get('Location')).toContain('signin=error');
    expect(cookieValue(res, 'sid')).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a tampered oauth cookie', async () => {
    const { to, oauth } = await start();
    const tampered = oauth.replace(/.$/, (ch) => (ch === 'A' ? 'B' : 'A'));
    const res = await call(`/auth/github/callback?code=abc&state=${to.searchParams.get('state')}`, { cookie: tampered });
    expect(res.headers.get('Location')).toContain('signin=error');
  });

  it('never redirects to a foreign site', async () => {
    const { oauth, to } = await start('https://evil.example/phish');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input instanceof Request ? input.url : input);
      return url.includes('access_token') ? Response.json({ access_token: 't' }) : Response.json({ id: 1, login: 'x', name: null, avatar_url: null });
    });
    const res = await call(`/auth/github/callback?code=abc&state=${to.searchParams.get('state')}`, { cookie: oauth });
    expect(res.headers.get('Location')).toBe(`${SITE}/?signin=ok`);
  });
});

describe('sync', () => {
  const sync = async (sid: string, since: number, ops: unknown[]) => {
    const res = await call('/sync', json({ since, ops }, sid));
    return { status: res.status, body: (await res.json()) as { seq: number; items: { kind: string; key: string; value: unknown; updatedAt: number; deleted: boolean }[]; rejected: { index: number; reason: string }[] } };
  };

  it('stores ops and returns them with a cursor', async () => {
    const sid = await login('gina');
    const { status, body } = await sync(sid, 0, [op('section', 'range-queries/9.1', { done: true }), op('note', 'range-queries/9.1', { text: 'p[b] - p[a-1]' })]);
    expect(status).toBe(200);
    expect(body.seq).toBe(1);
    expect(body.items.map((i) => i.key)).toEqual(['range-queries/9.1', 'range-queries/9.1']);
    expect(body.rejected).toEqual([]);
  });

  it('last writer wins: older updates are ignored, newer ones replace', async () => {
    const sid = await login('hari');
    await sync(sid, 0, [op('note', 'range-queries/9.2', { text: 'v2' }, T + 2000)]);
    await sync(sid, 0, [op('note', 'range-queries/9.2', { text: 'v1-stale' }, T + 1000)]);
    let state = (await sync(sid, 0, [])).body;
    expect(state.items.find((i) => i.key === 'range-queries/9.2')!.value).toEqual({ text: 'v2' });
    await sync(sid, 0, [op('note', 'range-queries/9.2', { text: 'v3' }, T + 3000)]);
    state = (await sync(sid, 0, [])).body;
    expect(state.items.find((i) => i.key === 'range-queries/9.2')!.value).toEqual({ text: 'v3' });
  });

  it('quiz attempts append instead of overwriting', async () => {
    const sid = await login('isha');
    await sync(sid, 0, [op('quiz', 'range-queries/1791000000001', { score: 6, total: 10 })]);
    await sync(sid, 0, [op('quiz', 'range-queries/1791000000002', { score: 9, total: 10 })]);
    const { body } = await sync(sid, 0, []);
    expect(body.items.filter((i) => i.kind === 'quiz')).toHaveLength(2);
  });

  it('pulls only what changed after the cursor, including other devices’ writes', async () => {
    const sid = await login('jay');
    const a = (await sync(sid, 0, [op('cses', '1646', { status: 'solved', code: 'class Main {}' })])).body;
    const b = (await sync(sid, 0, [op('cses', '1647', { status: 'attempted' })])).body; // "another device"
    const fromA = (await sync(sid, a.seq, [])).body;
    expect(fromA.items.map((i) => i.key)).toEqual(['1647']);
    expect(fromA.seq).toBe(b.seq);
    const state = await call(`/state?since=${a.seq}`, { cookie: sid });
    expect(((await state.json()) as { items: unknown[] }).items).toHaveLength(1);
  });

  it('supports deletes as tombstones', async () => {
    const sid = await login('kiran');
    await sync(sid, 0, [op('section', 'range-queries/9.4', { done: true }, T)]);
    await sync(sid, 0, [op('section', 'range-queries/9.4', null, T + 1, true)]);
    const item = (await sync(sid, 0, [])).body.items.find((i) => i.key === 'range-queries/9.4')!;
    expect(item.deleted).toBe(true);
    expect(item.value).toBeNull();
  });

  it('validates every op and reports rejects without blocking the rest', async () => {
    const sid = await login('lata');
    const { body } = await sync(sid, 0, [
      op('section', 'range-queries/9.1', { done: true }),
      op('section', '../../etc', { done: true }),
      op('note', 'range-queries/9.1', { text: 'x'.repeat(20_001) }),
      op('cses', '1646', { status: 'solved', code: 'x'.repeat(64_001) }),
      op('quiz', 'range-queries/1791000000001', { score: 11, total: 10 }),
      op('pref', 'lang', 'fr'),
      { kind: 'admin', key: 'x', value: 1, updatedAt: T },
    ]);
    expect(body.rejected.map((r) => r.index)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(body.items).toHaveLength(1);
  });

  it('caps batch size and clamps far-future clocks', async () => {
    const sid = await login('mohan');
    const many = Array.from({ length: 201 }, (_, i) => op('day', `2026-01-${String((i % 28) + 1).padStart(2, '0')}`, { active: true }));
    expect((await sync(sid, 0, many)).status).toBe(413);
    const future = Date.now() + 1000 * 60 * 60 * 24 * 365;
    const { body } = await sync(sid, 0, [op('pref', 'theme', 'dark', future)]);
    expect(body.items[0].updatedAt).toBeLessThan(Date.now() + 10 * 60 * 1000);
  });

  it('requires sign-in', async () => {
    expect((await call('/sync', json({ since: 0, ops: [] }))).status).toBe(401);
    expect((await call('/state')).status).toBe(401);
  });

  it('keeps users’ data separate', async () => {
    const a = await login('nina');
    const b = await login('omar');
    await sync(a, 0, [op('note', 'range-queries/9.3', { text: 'private' })]);
    expect((await sync(b, 0, [])).body.items).toEqual([]);
  });
});

describe('account', () => {
  it('exports and then deletes everything', async () => {
    const sid = await login('priya');
    await call('/sync', json({ since: 0, ops: [op('note', 'range-queries/9.1', { text: 'mine' })] }, sid));
    const exp = await call('/me/export', { cookie: sid });
    expect(exp.headers.get('Content-Disposition')).toContain('attachment');
    expect(((await exp.json()) as { items: unknown[] }).items).toHaveLength(1);

    const del = await call('/me', { method: 'DELETE', headers: { Origin: SITE, 'Content-Type': 'application/json' }, body: '{}', cookie: sid });
    expect(del.status).toBe(200);
    expect((await call('/me', { cookie: sid })).status).toBe(401);
    const left = await env.DB.prepare(
      "SELECT (SELECT COUNT(*) FROM users WHERE login = 'priya') + (SELECT COUNT(*) FROM items i JOIN users u ON u.id = i.user_id WHERE u.login = 'priya') AS n",
    ).first<number>('n');
    expect(left).toBe(0);
  });
});
