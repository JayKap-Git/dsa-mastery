import { Hono, type MiddlewareHandler } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { allowedOrigins, currentUser, devLogin, endSession, githubCallback, githubStart } from './auth';
import { deleteAccount, exportAll, getState, postSync } from './sync';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

/**
 * CORS for the study site only, with credentials. Anything that changes state must come from an
 * allowed Origin with a JSON body; that forces a CORS preflight, which together with the
 * SameSite=Lax session cookie blocks cross-site request forgery.
 */
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  const allowed = !!origin && allowedOrigins(c.env).includes(origin);

  if (c.req.method === 'OPTIONS') {
    if (!allowed) return c.body(null, 403);
    return c.body(null, 204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    });
  }

  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    if (!allowed) return c.json({ error: 'origin not allowed' }, 403);
    if (!c.req.header('Content-Type')?.toLowerCase().startsWith('application/json')) return c.json({ error: 'JSON body required' }, 415);
  }

  await next();

  if (allowed) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
    c.res.headers.append('Vary', 'Origin');
  }
  c.res.headers.set('Cache-Control', 'no-store');
});

const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: 'not signed in' }, 401);
  c.set('user', user);
  await next();
};

app.get('/', (c) => c.json({ name: 'dsa-mastery-api', ok: true }));

// Sign-in
app.get('/auth/github', githubStart);
app.get('/auth/github/callback', githubCallback);
app.post('/auth/dev-login', devLogin);
app.post('/auth/logout', async (c) => {
  await endSession(c);
  return c.json({ ok: true });
});

// Account
app.get('/me', async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ user: null }, 401);
  return c.json({ user: { login: user.login, name: user.name, avatarUrl: user.avatarUrl } });
});
app.get('/me/export', requireUser, exportAll);
app.delete('/me', requireUser, async (c) => {
  await deleteAccount(c);
  deleteCookie(c, 'sid', { path: '/', secure: true });
  return c.json({ ok: true });
});

// Sync
app.get('/state', requireUser, getState);
app.post('/sync', requireUser, postSync);

app.notFound((c) => c.json({ error: 'not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal error' }, 500);
});

export default app;
