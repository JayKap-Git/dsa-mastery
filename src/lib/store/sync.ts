// Account + sync engine. Signed out: nothing here runs and the site works from local storage.
// Signed in: local changes are pushed and everyone else's are pulled, last-writer-wins per item.
import { API_URL } from '../config';
import { LIMITS, type RemoteItem } from './kinds';
import { ackOps, applyRemote, clearAll, pendingOps, subscribe } from './items';

export interface User {
  login: string;
  name: string | null;
  avatarUrl: string | null;
}
export type SyncStatus = 'off' | 'syncing' | 'synced' | 'offline' | 'error';

const META_KEY = 'dsa-mastery:sync:v2';
const USER_KEY = 'dsa-mastery:user:v2';

interface Meta { seq: number; owner: string | null }

const ls = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};
const readJson = <T>(k: string, fallback: T): T => {
  try {
    return (JSON.parse(ls()?.getItem(k) ?? 'null') as T) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (k: string, v: unknown) => {
  try {
    ls()?.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

let user: User | null = readJson<User | null>(USER_KEY, null);
let status: SyncStatus = user ? 'synced' : 'off';
const bus = new EventTarget();

export const cachedUser = () => user;
export const syncStatus = () => status;
export function onAccountChange(cb: () => void) {
  bus.addEventListener('change', cb);
  return () => bus.removeEventListener('change', cb);
}
const emit = () => bus.dispatchEvent(new Event('change'));
const setStatus = (s: SyncStatus) => {
  if (s !== status) {
    status = s;
    emit();
  }
};

function setUser(u: User | null) {
  if (u) {
    const meta = readJson<Meta>(META_KEY, { seq: 0, owner: null });
    // A different account signed in on this device: its data lives on the server, so start clean.
    if (meta.owner && meta.owner !== u.login) {
      clearAll();
      writeJson(META_KEY, { seq: 0, owner: u.login });
    } else if (!meta.owner) {
      // First sign-in here: whatever was studied anonymously is in the outbox and uploads now.
      writeJson(META_KEY, { ...meta, owner: u.login });
    }
  }
  user = u;
  writeJson(USER_KEY, u);
  if (!u) status = 'off';
  emit();
}

/** Ask the API who is signed in. Offline → keep the cached answer. */
export async function refreshUser(): Promise<User | null> {
  try {
    const r = await fetch(`${API_URL}/me`, { credentials: 'include' });
    if (r.status === 401) setUser(null);
    else if (r.ok) setUser(((await r.json()) as { user: User }).user);
  } catch {
    /* offline or API down: keep cached user */
  }
  return user;
}

// ───────── sync ─────────

let running = false;
let again = false;
let failures = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

export async function syncNow(opts: { keepalive?: boolean } = {}): Promise<void> {
  if (!user) return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  clearTimeout(retryTimer);
  setStatus('syncing');
  try {
    for (let round = 0; round < 10; round++) {
      again = false;
      const meta = readJson<Meta>(META_KEY, { seq: 0, owner: user.login });
      const ops = pendingOps().slice(0, LIMITS.opsPerSync);
      const body = JSON.stringify({ since: meta.seq, ops });
      const r = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: !!opts.keepalive && body.length < 60_000,
      });
      if (r.status === 401) {
        setUser(null); // session expired; local data stays, sign in again to resume
        return;
      }
      if (!r.ok) throw new Error(`sync failed: ${r.status}`);
      const data = (await r.json()) as { seq: number; items: RemoteItem[]; rejected?: { index: number; reason: string }[] };
      ackOps(ops); // rejected ops are dropped too: they could never succeed
      if (data.rejected?.length) console.warn('Some changes were rejected by the server', data.rejected);
      applyRemote(data.items);
      writeJson(META_KEY, { ...meta, seq: data.seq });
      if (!again && pendingOps().length === 0) break;
    }
    failures = 0;
    setStatus('synced');
  } catch {
    failures++;
    setStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'error');
    retryTimer = setTimeout(() => void syncNow(), Math.min(60_000, 2000 * 2 ** (failures - 1)));
  } finally {
    running = false;
  }
}

let started = false;
let debounce: ReturnType<typeof setTimeout> | undefined;

/** Wire up automatic syncing. Safe to call more than once. */
export function startSync() {
  if (started || typeof window === 'undefined') return;
  started = true;
  subscribe((source) => {
    if (source !== 'local' || !user) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => void syncNow(), 2000);
  });
  document.addEventListener('visibilitychange', () => {
    if (!user) return;
    if (document.visibilityState === 'hidden') void syncNow({ keepalive: true });
    else void syncNow();
  });
  window.addEventListener('online', () => void syncNow());
  setInterval(() => document.visibilityState === 'visible' && void syncNow(), 60_000);
  void syncNow();
}

// ───────── account actions ─────────

export function signIn() {
  const here = new URL(location.href);
  here.searchParams.delete('signin');
  location.href = `${API_URL}/auth/github?return=${encodeURIComponent(here.toString())}`;
}

export async function signOut(): Promise<boolean> {
  await syncNow();
  if (pendingOps().length && !confirm('Some changes haven’t synced yet and will be lost. Sign out anyway?')) return false;
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  } catch {
    /* the cookie expires on its own */
  }
  clearAll(); // your data is safe on the server; this device forgets it
  writeJson(META_KEY, { seq: 0, owner: null });
  setUser(null);
  return true;
}

export async function deleteAccount(): Promise<boolean> {
  const r = await fetch(`${API_URL}/me`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!r.ok) return false;
  clearAll();
  writeJson(META_KEY, { seq: 0, owner: null });
  setUser(null);
  return true;
}

export const exportUrl = () => `${API_URL}/me/export`;

/** Tests only. */
export function _setUserForTests(u: User | null) {
  user = u;
}
