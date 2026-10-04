import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Op, RemoteItem } from '../../../shared/kinds';
import { _useStorage, ackOps, applyRemote, get, pendingOps, put } from './items';
import { migrateV1 } from './migrate';
import { allNotes, bestQuiz, cses, dayKey, heatmap, note, quizHistory, recordQuiz, sectionsDone, setCses, setNote, setSectionDone, streak } from './selectors';
import { _setUserForTests, syncNow, syncStatus } from './sync';

class MemoryStorage implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
}

/** Switch to another "device": its own localStorage, same signed-in user. */
function device(s = new MemoryStorage(), login: string | null = 'jayant') {
  (globalThis as { localStorage?: Storage }).localStorage = s;
  _useStorage(s);
  _setUserForTests(login ? { login, name: null, avatarUrl: null } : null);
  return s;
}

/** Mirrors the Worker's rules: LWW upsert per item, per-write seq, pull by cursor. */
class FakeServer {
  items = new Map<string, RemoteItem>();
  seq = 0;
  down = false;
  handle(body: { since: number; ops: Op[] }) {
    if (body.ops.length) {
      this.seq++;
      for (const op of body.ops) {
        const id = `${op.kind}|${op.key}`;
        const cur = this.items.get(id);
        if (!cur || op.updatedAt > cur.updatedAt) this.items.set(id, { ...op, value: op.deleted ? null : op.value, deleted: !!op.deleted, seq: this.seq });
      }
    }
    return { seq: this.seq, items: [...this.items.values()].filter((i) => i.seq > body.since), rejected: [] };
  }
}

let server: FakeServer;
let now = Date.UTC(2026, 9, 4, 10, 0, 0);
const tick = (ms = 1000) => vi.setSystemTime((now += ms));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(now);
  server = new FakeServer();
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (server.down) throw new TypeError('network down');
    if (url.endsWith('/sync')) return Response.json(server.handle(JSON.parse(String(init!.body))));
    return new Response('{}', { status: 404 });
  });
  device();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('local store', () => {
  it('reads back what it writes and queues one op per item', () => {
    setSectionDone('range-queries', '9.1', true);
    setNote('range-queries', '9.1', 'first');
    tick();
    setNote('range-queries', '9.1', 'second');
    expect(sectionsDone('range-queries')).toEqual(['9.1']);
    expect(note('range-queries', '9.1')).toBe('second');
    const notes = pendingOps().filter((o) => o.kind === 'note');
    expect(notes).toHaveLength(1); // compacted to the newest change
    expect(notes[0].value).toEqual({ text: 'second' });
  });

  it('refuses invalid values instead of storing them', () => {
    expect(setNote('range-queries', '9.1', 'x'.repeat(20_001))).toBe(false);
    expect(note('range-queries', '9.1')).toBe('');
  });

  it('applies remote items only when they are newer', () => {
    put('note', 'range-queries/9.2', { text: 'local' }, 2000_000_000_000);
    applyRemote([{ kind: 'note', key: 'range-queries/9.2', value: { text: 'older' }, updatedAt: 1999_000_000_000, seq: 1 }]);
    expect(note('range-queries', '9.2')).toBe('local');
    applyRemote([{ kind: 'note', key: 'range-queries/9.2', value: { text: 'newer' }, updatedAt: 2001_000_000_000, seq: 2 }]);
    expect(note('range-queries', '9.2')).toBe('newer');
    expect(pendingOps().find((o) => o.key === 'range-queries/9.2')).toBeUndefined(); // superseded
  });

  it('keeps an edit made while a sync was in flight', () => {
    setNote('range-queries', '9.3', 'v1');
    const sent = pendingOps();
    tick();
    setNote('range-queries', '9.3', 'v2'); // typed during the request
    ackOps(sent);
    expect(pendingOps().map((o) => (o.value as { text: string }).text)).toEqual(['v2']);
  });

  it('records quiz history and the best attempt', () => {
    recordQuiz('range-queries', 6, 10);
    tick();
    recordQuiz('range-queries', 9, 10);
    tick();
    recordQuiz('range-queries', 7, 10);
    expect(quizHistory('range-queries').map((a) => a.score)).toEqual([6, 9, 7]);
    expect(bestQuiz('range-queries')?.score).toBe(9);
  });

  it('tracks CSES status and code', () => {
    setCses(1646, 'solved', 'public class Main {}');
    expect(cses(1646)).toEqual({ status: 'solved', code: 'public class Main {}' });
    setCses(1646, 'attempted');
    expect(cses(1646)).toEqual({ status: 'attempted' });
  });
});

describe('streak and heatmap', () => {
  const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

  it('counts consecutive days, and survives until you study today', () => {
    for (const d of [1, 2, 3]) put('day', dayKey(at(2026, 10, d)), { active: true });
    expect(streak(at(2026, 10, 3))).toBe(3);
    expect(streak(at(2026, 10, 4))).toBe(3); // nothing yet today: yesterday still counts
    expect(streak(at(2026, 10, 5))).toBe(0); // missed a day
  });

  it('builds whole Monday→Sunday weeks ending this week', () => {
    put('day', dayKey(at(2026, 10, 4)), { active: true });
    const cells = heatmap(16, at(2026, 10, 4)); // a Sunday
    expect(cells).toHaveLength(16 * 7);
    expect(new Date(`${cells[0].date}T12:00`).getDay()).toBe(1); // Monday
    expect(cells.at(-1)!.date).toBe('2026-10-04');
    expect(cells.filter((c) => c.active)).toHaveLength(1);
  });

  it('learning actions mark today active', () => {
    setSectionDone('range-queries', '9.1', true);
    expect(get('day', dayKey())).toEqual({ active: true });
  });
});

describe('v1 → v2 migration', () => {
  it('keeps old progress, quiz score and language', () => {
    const s = device(new MemoryStorage(), null);
    s.setItem('dsa-mastery:progress:v1', JSON.stringify({
      v: 1,
      last: 'range-queries',
      chapters: { 'range-queries': { sections: ['9.1', '9.3'], quiz: { score: 9, total: 10, at: 1_791_117_134_615 }, visitedAt: 1_791_117_000_000 } },
    }));
    s.setItem('dsa-mastery:lang', 'hi');
    expect(migrateV1()).toBe(true);
    expect(sectionsDone('range-queries').sort()).toEqual(['9.1', '9.3']);
    expect(bestQuiz('range-queries')).toMatchObject({ score: 9, total: 10 });
    expect(get('pref', 'lang')).toBe('hi');
    expect(get('pref', 'last')).toBe('range-queries');
    expect(migrateV1()).toBe(false); // only once
    expect(pendingOps().length).toBeGreaterThan(0); // will upload on first sign-in
  });
});

describe('sync between two devices', () => {
  it('moves progress, notes and solutions to a second device and merges edits back', async () => {
    const laptop = device();
    setSectionDone('range-queries', '9.1', true);
    setNote('range-queries', '9.1', 'p[b] - p[a-1]');
    setCses(1646, 'solved', 'class Main {}');
    recordQuiz('range-queries', 8, 10);
    await syncNow();
    expect(syncStatus()).toBe('synced');
    expect(pendingOps()).toEqual([]);

    const phone = device();
    await syncNow();
    expect(sectionsDone('range-queries')).toEqual(['9.1']);
    expect(note('range-queries', '9.1')).toBe('p[b] - p[a-1]');
    expect(cses(1646)?.status).toBe('solved');
    expect(bestQuiz('range-queries')?.score).toBe(8);

    tick(60_000);
    setNote('range-queries', '9.1', 'edited on phone');
    await syncNow();

    device(laptop);
    await syncNow();
    expect(note('range-queries', '9.1')).toBe('edited on phone');
    expect(allNotes()).toHaveLength(1);
    void phone;
  });

  it('keeps offline edits and syncs them when the network returns', async () => {
    server.down = true;
    setSectionDone('range-queries', '9.2', true);
    await syncNow();
    expect(syncStatus()).toBe('error');
    expect(pendingOps().length).toBeGreaterThan(0);
    server.down = false;
    await syncNow();
    expect(syncStatus()).toBe('synced');
    expect(pendingOps()).toEqual([]);
    expect([...server.items.keys()]).toContain('section|range-queries/9.2');
  });

  it('does nothing while signed out', async () => {
    device(new MemoryStorage(), null);
    setSectionDone('range-queries', '9.4', true);
    await syncNow();
    expect(server.items.size).toBe(0);
    expect(pendingOps().length).toBeGreaterThan(0); // waits for sign-in
  });
});
