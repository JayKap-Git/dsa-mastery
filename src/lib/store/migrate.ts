// One-time upgrade from the v1 progress format (src/lib/progress.ts, before accounts existed)
// to the v2 item store, so nobody loses progress. Migrated items land in the outbox, so they
// upload on first sign-in.
import { put } from './items';

const V1_KEY = 'dsa-mastery:progress:v1';
const DONE_KEY = 'dsa-mastery:migrated:v2';

interface V1 {
  v: 1;
  chapters: Record<string, { sections: string[]; quiz?: { score: number; total: number; at: number }; visitedAt?: number }>;
  last?: string;
}

const ls = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function migrateV1(): boolean {
  const s = ls();
  if (!s || s.getItem(DONE_KEY)) return false;
  let v1: V1 | null = null;
  try {
    v1 = JSON.parse(s.getItem(V1_KEY) ?? 'null') as V1 | null;
  } catch {
    v1 = null;
  }
  const now = Date.now();
  if (v1?.v === 1 && v1.chapters) {
    for (const [slug, c] of Object.entries(v1.chapters)) {
      const at = c.visitedAt ?? now;
      for (const id of c.sections ?? []) put('section', `${slug}/${id}`, { done: true }, at);
      if (c.quiz) put('quiz', `${slug}/${c.quiz.at}`, { score: c.quiz.score, total: c.quiz.total }, c.quiz.at);
      if (c.visitedAt) put('visit', slug, { at: c.visitedAt }, c.visitedAt);
    }
    if (v1.last) put('pref', 'last', v1.last, now);
  }
  const lang = s.getItem('dsa-mastery:lang');
  if (lang === 'en' || lang === 'hi' || lang === 'both') put('pref', 'lang', lang, now);
  const theme = s.getItem('dsa-mastery:theme');
  if (theme === 'light' || theme === 'dark') put('pref', 'theme', theme, now);
  s.setItem(DONE_KEY, String(now));
  return true;
}
