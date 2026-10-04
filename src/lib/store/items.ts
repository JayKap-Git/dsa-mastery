// The local item store: every piece of study state, kept in this browser's localStorage.
// It is the source of truth for the UI (instant, works offline). Each local change is also queued
// in an outbox, which the sync engine (./sync.ts) sends to the server when the user is signed in.
import { isNewer, validateOp, type Kind, type Op, type RemoteItem, type Values } from '../../../shared/kinds';

const ITEMS_KEY = 'dsa-mastery:items:v2';
const OUTBOX_KEY = 'dsa-mastery:outbox:v2';

interface Entry {
  value: unknown;
  updatedAt: number;
  deleted?: boolean;
}

const idOf = (kind: Kind, key: string) => `${kind}|${key}`;

let storage: Storage | null | undefined;
const store = (): Storage | null => {
  if (storage !== undefined) return storage;
  try {
    storage = globalThis.localStorage ?? null;
  } catch {
    storage = null; // blocked storage: behave like a fresh, in-memory session
  }
  return storage;
};

function read<T>(k: string, fallback: T): T {
  try {
    const raw = store()?.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(k: string, v: unknown) {
  try {
    store()?.setItem(k, JSON.stringify(v));
  } catch {
    /* quota or blocked: keep the in-memory copy */
  }
}

let items: Record<string, Entry> | null = null;
let outbox: Record<string, Op> | null = null;
const all = () => (items ??= read<Record<string, Entry>>(ITEMS_KEY, {}));
const box = () => (outbox ??= read<Record<string, Op>>(OUTBOX_KEY, {}));

// ───────── change notifications ─────────

export type ChangeSource = 'local' | 'remote';
const bus = new EventTarget();
let version = 0;

const emit = (source: ChangeSource) => {
  version++;
  bus.dispatchEvent(new CustomEvent('change', { detail: source }));
};

/** Called after every change. `source` says whether it came from this device or from the server. */
export function subscribe(cb: (source: ChangeSource) => void): () => void {
  const h = (e: Event) => cb((e as CustomEvent<ChangeSource>).detail);
  bus.addEventListener('change', h);
  return () => bus.removeEventListener('change', h);
}

/** Increments on every change, for React's useSyncExternalStore. */
export const getVersion = () => version;

if (typeof window !== 'undefined') {
  // Another tab changed the store: drop our cache and re-render.
  window.addEventListener('storage', (e) => {
    if (e.key === ITEMS_KEY || e.key === OUTBOX_KEY) {
      items = outbox = null;
      emit('remote');
    }
  });
}

// ───────── reads ─────────

export function get<K extends Kind>(kind: K, key: string): Values[K] | undefined {
  const e = all()[idOf(kind, key)];
  return e && !e.deleted ? (e.value as Values[K]) : undefined;
}

export function list<K extends Kind>(kind: K): { key: string; value: Values[K]; updatedAt: number }[] {
  const prefix = `${kind}|`;
  return Object.entries(all())
    .filter(([id, e]) => id.startsWith(prefix) && !e.deleted)
    .map(([id, e]) => ({ key: id.slice(prefix.length), value: e.value as Values[K], updatedAt: e.updatedAt }));
}

// ───────── local writes ─────────

function record(op: Op): boolean {
  const reason = validateOp(op);
  if (reason) {
    console.warn(`Not saved: ${reason}`, op);
    return false;
  }
  const id = idOf(op.kind, op.key);
  all()[id] = { value: op.value, updatedAt: op.updatedAt, ...(op.deleted ? { deleted: true } : {}) };
  box()[id] = op; // the outbox keeps only the newest change per item
  write(ITEMS_KEY, all());
  write(OUTBOX_KEY, box());
  emit('local');
  return true;
}

export function put<K extends Kind>(kind: K, key: string, value: Values[K], updatedAt = Date.now()): boolean {
  return record({ kind, key, value, updatedAt });
}

export function remove(kind: Kind, key: string, updatedAt = Date.now()): boolean {
  if (!all()[idOf(kind, key)]) return true;
  return record({ kind, key, value: null, updatedAt, deleted: true });
}

// ───────── sync plumbing ─────────

/** Server items, merged last-writer-wins. Returns how many local items changed. */
export function applyRemote(remote: RemoteItem[]): number {
  let changed = 0;
  const m = all();
  for (const r of remote) {
    const id = idOf(r.kind, r.key);
    if (isNewer(r, m[id])) {
      m[id] = { value: r.value, updatedAt: r.updatedAt, ...(r.deleted ? { deleted: true } : {}) };
      changed++;
    }
    const pending = box()[id];
    if (pending && pending.updatedAt <= r.updatedAt) delete box()[id]; // the server already has something as new
  }
  if (changed) write(ITEMS_KEY, m);
  write(OUTBOX_KEY, box());
  if (changed) emit('remote');
  return changed;
}

export const pendingOps = (): Op[] => Object.values(box());

/** Remove sent ops from the outbox, unless the item changed again while the request was in flight. */
export function ackOps(sent: Op[]) {
  const b = box();
  for (const op of sent) {
    const id = idOf(op.kind, op.key);
    if (b[id] && b[id].updatedAt <= op.updatedAt) delete b[id];
  }
  write(OUTBOX_KEY, b);
}

/** Forget everything on this device (used when signing out). */
export function clearAll() {
  items = {};
  outbox = {};
  write(ITEMS_KEY, items);
  write(OUTBOX_KEY, outbox);
  emit('remote');
}

export function exportLocal() {
  return { exportedAt: new Date().toISOString(), items: all() };
}

/** Tests only: point the store at another Storage (another "device") and drop caches. */
export function _useStorage(s: Storage | null) {
  storage = s;
  items = outbox = null;
}
