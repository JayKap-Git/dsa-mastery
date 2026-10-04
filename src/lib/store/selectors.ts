// Read-side helpers over the item store, plus the small set of write actions the UI uses.
import { get, list, put, remove } from './items';
import type { CsesStatus, Values } from './kinds';

/** Local calendar date as YYYY-MM-DD (the key for `day` items). */
export function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ───────── reads ─────────

export const sectionsDone = (slug: string): string[] =>
  list('section').filter((i) => i.key.startsWith(`${slug}/`) && i.value.done).map((i) => i.key.slice(slug.length + 1));

export const allSectionsDone = (): number => list('section').filter((i) => i.value.done).length;

export interface QuizAttempt { at: number; score: number; total: number }

export const quizHistory = (slug: string): QuizAttempt[] =>
  list('quiz')
    .filter((i) => i.key.startsWith(`${slug}/`))
    .map((i) => ({ at: Number(i.key.slice(slug.length + 1)), ...i.value }))
    .sort((a, b) => a.at - b.at);

export const bestQuiz = (slug: string): QuizAttempt | undefined =>
  quizHistory(slug).reduce<QuizAttempt | undefined>((best, a) => (!best || a.score / a.total > best.score / best.total ? a : best), undefined);

export const quizzedChapters = (): number => new Set(list('quiz').map((i) => i.key.split('/')[0])).size;

export const note = (slug: string, section: string): string => get('note', `${slug}/${section}`)?.text ?? '';

export const allNotes = () =>
  list('note')
    .filter((i) => i.value.text.trim())
    .map((i) => {
      const [slug, section] = i.key.split('/');
      return { slug, section, text: i.value.text, updatedAt: i.updatedAt };
    });

export const cses = (id: number | string): Values['cses'] | undefined => get('cses', String(id));

export const allCses = () => list('cses').map((i) => ({ id: Number(i.key), ...i.value, updatedAt: i.updatedAt }));

export const solvedCount = (ids?: number[]): number =>
  (ids ? ids.map((id) => cses(id)) : allCses()).filter((e) => e?.status === 'solved').length;

export const pref = (k: 'lang' | 'theme' | 'last') => get('pref', k);

/** The chapter to "continue": the last one opened. */
export const lastChapter = (): string | undefined => {
  const last = pref('last');
  if (last) return last;
  return list('visit').sort((a, b) => b.value.at - a.value.at)[0]?.key;
};

/** Consecutive study days ending today (or yesterday, so the streak survives until you study today). */
export function streak(today = new Date()): number {
  const days = new Set(list('day').map((i) => i.key));
  const d = new Date(today);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** The last `weeks` weeks of activity, oldest first, aligned so each column is Monday→Sunday. */
export function heatmap(weeks = 16, today = new Date()): { date: string; active: boolean; future: boolean }[] {
  const days = new Set(list('day').map((i) => i.key));
  const sunday = new Date(today); // the end of this week
  sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  const start = new Date(sunday);
  start.setDate(sunday.getDate() - weeks * 7 + 1);
  const todayKey = dayKey(today);
  const out = [];
  for (const d = new Date(start); d <= sunday; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d);
    out.push({ date: k, active: days.has(k), future: k > todayKey });
  }
  return out;
}

// ───────── writes ─────────

/** Learning actions mark today as an active day (drives the streak). */
const markActive = () => {
  const k = dayKey();
  if (!get('day', k)) put('day', k, { active: true });
};

export function setSectionDone(slug: string, section: string, done: boolean) {
  put('section', `${slug}/${section}`, { done });
  if (done) markActive();
}

export function recordQuiz(slug: string, score: number, total: number) {
  put('quiz', `${slug}/${Date.now()}`, { score, total });
  markActive();
}

export function setNote(slug: string, section: string, text: string): boolean {
  const key = `${slug}/${section}`;
  const ok = text.trim() ? put('note', key, { text }) : remove('note', key);
  if (ok && text.trim()) markActive();
  return ok;
}

export function setCses(id: number | string, status: CsesStatus, code?: string): boolean {
  const ok = put('cses', String(id), code ? { status, code } : { status });
  if (ok && status !== 'todo') markActive();
  return ok;
}

export function setPref(k: 'lang' | 'theme', v: string) {
  if (pref(k) !== v) put('pref', k, v);
}

export function visit(slug: string) {
  put('visit', slug, { at: Date.now() });
  if (pref('last') !== slug) put('pref', 'last', slug);
}
