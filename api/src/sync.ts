import type { Context } from 'hono';
import { LIMITS, validateOp, type Op, type RemoteItem } from '../../shared/kinds';
import type { AppEnv } from './types';

interface Row { kind: string; key: string; value: string; updated_at: number; deleted: number; server_seq: number }

const toItem = (r: Row): RemoteItem => ({
  kind: r.kind as RemoteItem['kind'],
  key: r.key,
  value: JSON.parse(r.value),
  updatedAt: r.updated_at,
  deleted: r.deleted === 1,
  seq: r.server_seq,
});

/** Everything written after `since`. If the client's cursor is ahead of the server (e.g. a reset), send everything. */
async function pull(db: D1Database, userId: number, since: number) {
  const seq = (await db.prepare('SELECT seq FROM users WHERE id = ?').bind(userId).first<number>('seq')) ?? 0;
  const from = since > seq ? 0 : since;
  const { results } = await db
    .prepare('SELECT kind, key, value, updated_at, deleted, server_seq FROM items WHERE user_id = ? AND server_seq > ? ORDER BY server_seq')
    .bind(userId, from)
    .all<Row>();
  return { seq, reset: from !== since, items: results.map(toItem) };
}

const cursor = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : 0);

export async function getState(c: Context<AppEnv>) {
  return c.json(await pull(c.env.DB, c.get('user').id, cursor(Number(c.req.query('since') ?? 0))));
}

/** Push this device's changes (last-writer-wins per item) and pull everyone else's in one round trip. */
export async function postSync(c: Context<AppEnv>) {
  const user = c.get('user');
  const db = c.env.DB;
  const body = (await c.req.json().catch(() => null)) as { ops?: unknown; since?: unknown } | null;
  if (!body || !Array.isArray(body.ops)) return c.json({ error: 'body must be {since, ops: []}' }, 400);
  if (body.ops.length > LIMITS.opsPerSync) return c.json({ error: `at most ${LIMITS.opsPerSync} ops per sync` }, 413);

  const accepted: Op[] = [];
  const rejected: { index: number; reason: string }[] = [];
  body.ops.forEach((op, index) => {
    const reason = validateOp(op);
    if (reason) rejected.push({ index, reason });
    else accepted.push(op as Op);
  });

  if (accepted.length) {
    const count = (await db.prepare('SELECT COUNT(*) AS n FROM items WHERE user_id = ?').bind(user.id).first<number>('n')) ?? 0;
    if (count >= LIMITS.itemsPerUser) return c.json({ error: 'storage quota reached' }, 413);

    const seq = await db.prepare('UPDATE users SET seq = seq + 1 WHERE id = ? RETURNING seq').bind(user.id).first<number>('seq');
    const latest = Date.now() + LIMITS.maxClockSkewMs;
    const upsert = db.prepare(
      `INSERT INTO items (user_id, kind, key, value, updated_at, deleted, server_seq) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, kind, key) DO UPDATE SET
         value = excluded.value, updated_at = excluded.updated_at, deleted = excluded.deleted, server_seq = excluded.server_seq
       WHERE excluded.updated_at > items.updated_at`,
    );
    await db.batch(
      accepted.map((op) =>
        upsert.bind(user.id, op.kind, op.key, JSON.stringify(op.deleted ? null : op.value), Math.min(op.updatedAt, latest), op.deleted ? 1 : 0, seq),
      ),
    );
  }

  return c.json({ ...(await pull(db, user.id, cursor(body.since))), rejected });
}

export async function exportAll(c: Context<AppEnv>) {
  const user = c.get('user');
  const { results } = await c.env.DB
    .prepare('SELECT kind, key, value, updated_at, deleted, server_seq FROM items WHERE user_id = ? AND deleted = 0 ORDER BY kind, key')
    .bind(user.id)
    .all<Row>();
  c.header('Content-Disposition', 'attachment; filename="dsa-mastery-export.json"');
  return c.json({ exportedAt: new Date().toISOString(), user: { login: user.login, name: user.name }, items: results.map(toItem) });
}

export async function deleteAccount(c: Context<AppEnv>) {
  const id = c.get('user').id;
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM items WHERE user_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id),
  ]);
}
