// What can be stored and synced. Shared by the site (src/lib/store) and the Worker (api/src),
// so both sides enforce exactly the same rules. Plain TypeScript, no imports.

export const KINDS = ['section', 'quiz', 'note', 'cses', 'pref', 'visit', 'day'] as const;
export type Kind = (typeof KINDS)[number];

export type CsesStatus = 'todo' | 'attempted' | 'solved';

/** Value shape per kind. */
export interface Values {
  section: { done: boolean }; // key: "<chapter-slug>/<section id>", e.g. "range-queries/9.3"
  quiz: { score: number; total: number }; // key: "<chapter-slug>/<attempt ms timestamp>" (append-only)
  note: { text: string }; // key: "<chapter-slug>/<section id>"
  cses: { status: CsesStatus; code?: string }; // key: CSES task id, e.g. "1646"
  pref: string; // key: "lang" | "theme" | "last"
  visit: { at: number }; // key: "<chapter-slug>"
  day: { active: true }; // key: local date "YYYY-MM-DD"
}

/** One change, as sent from a device to the server. Newest `updatedAt` wins (last-writer-wins). */
export interface Op<K extends Kind = Kind> {
  kind: K;
  key: string;
  value: Values[K] | null; // null when deleted
  updatedAt: number; // ms since epoch, stamped by the device that made the change
  deleted?: boolean;
}

/** An item as returned by the server, with its server write sequence number. */
export interface RemoteItem extends Op {
  seq: number;
}

export const LIMITS = {
  opsPerSync: 200,
  itemsPerUser: 5000,
  noteChars: 20_000,
  codeChars: 64_000,
  /** Clocks more than this far in the future are clamped to "now" on the server. */
  maxClockSkewMs: 5 * 60 * 1000,
} as const;

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const KEY_RULES: Record<Kind, RegExp> = {
  section: new RegExp(`^${SLUG}/\\d{1,2}\\.\\d{1,2}$`),
  quiz: new RegExp(`^${SLUG}/\\d{12,14}$`),
  note: new RegExp(`^${SLUG}/\\d{1,2}\\.\\d{1,2}$`),
  cses: /^\d{1,5}$/,
  pref: /^(lang|theme|last)$/,
  visit: new RegExp(`^${SLUG}$`),
  day: /^\d{4}-\d{2}-\d{2}$/,
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown, lo: number, hi: number) => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi;
const exactKeys = (v: Record<string, unknown>, allowed: string[]) => Object.keys(v).every((k) => allowed.includes(k));

function checkValue(kind: Kind, key: string, v: unknown): string | null {
  switch (kind) {
    case 'section':
      return isObj(v) && exactKeys(v, ['done']) && typeof v.done === 'boolean' ? null : 'section value must be {done: boolean}';
    case 'quiz':
      return isObj(v) && exactKeys(v, ['score', 'total']) && isInt(v.total, 1, 100) && isInt(v.score, 0, v.total as number)
        ? null
        : 'quiz value must be {score, total} with 0 ≤ score ≤ total ≤ 100';
    case 'note':
      return isObj(v) && exactKeys(v, ['text']) && typeof v.text === 'string' && v.text.length <= LIMITS.noteChars
        ? null
        : `note value must be {text} up to ${LIMITS.noteChars} characters`;
    case 'cses':
      return isObj(v) && exactKeys(v, ['status', 'code']) &&
        (v.status === 'todo' || v.status === 'attempted' || v.status === 'solved') &&
        (v.code === undefined || (typeof v.code === 'string' && v.code.length <= LIMITS.codeChars))
        ? null
        : `cses value must be {status, code?} with code up to ${LIMITS.codeChars} characters`;
    case 'pref':
      if (key === 'lang') return v === 'en' || v === 'hi' || v === 'both' ? null : 'lang must be en, hi or both';
      if (key === 'theme') return v === 'light' || v === 'dark' ? null : 'theme must be light or dark';
      return typeof v === 'string' && new RegExp(`^${SLUG}$`).test(v) ? null : 'last must be a chapter slug';
    case 'visit':
      return isObj(v) && exactKeys(v, ['at']) && isInt(v.at, 0, 1e13) ? null : 'visit value must be {at}';
    case 'day':
      return isObj(v) && exactKeys(v, ['active']) && v.active === true ? null : 'day value must be {active: true}';
  }
}

/** Returns why an op is invalid, or null if it is fine. */
export function validateOp(op: unknown): string | null {
  if (!isObj(op)) return 'op must be an object';
  const { kind, key, value, updatedAt, deleted } = op;
  if (typeof kind !== 'string' || !(KINDS as readonly string[]).includes(kind)) return 'unknown kind';
  if (typeof key !== 'string' || !KEY_RULES[kind as Kind].test(key)) return `bad key for ${kind}`;
  if (!isInt(updatedAt, 1_577_836_800_000, 9_999_999_999_999)) return 'updatedAt must be a ms timestamp';
  if (deleted !== undefined && typeof deleted !== 'boolean') return 'deleted must be boolean';
  if (deleted) return value === null ? null : 'deleted ops must have value null';
  return checkValue(kind as Kind, key, value);
}

/** Last-writer-wins: does `incoming` replace `current`? Ties keep the current value (same rule as the SQL upsert). */
export const isNewer = (incoming: { updatedAt: number }, current: { updatedAt: number } | undefined) =>
  !current || incoming.updatedAt > current.updatedAt;
