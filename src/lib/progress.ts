// Study progress, kept in this browser's localStorage. Every access is wrapped in try/catch:
// private windows and blocked storage simply behave like a fresh start.

const KEY = 'dsa-mastery:progress:v1';
export const PROGRESS_EVENT = 'dsa-progress';

export interface ChapterProgress {
  sections: string[]; // section ids marked done, e.g. "9.3"
  quiz?: { score: number; total: number; at: number };
  visitedAt?: number;
}

export interface Progress {
  v: 1;
  chapters: Record<string, ChapterProgress>;
  last?: string; // slug of the last chapter opened
}

const empty = (): Progress => ({ v: 1, chapters: {} });

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Progress;
    return p && p.v === 1 && typeof p.chapters === 'object' ? p : empty();
  } catch {
    return empty();
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — progress lives only for this page view */
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

function update(fn: (p: Progress) => void): Progress {
  const p = load();
  fn(p);
  save(p);
  return p;
}

const chapter = (p: Progress, slug: string) => (p.chapters[slug] ??= { sections: [] });

export function setSection(slug: string, id: string, done: boolean) {
  update((p) => {
    const c = chapter(p, slug);
    c.sections = done ? [...new Set([...c.sections, id])] : c.sections.filter((s) => s !== id);
  });
}

export function recordQuiz(slug: string, score: number, total: number) {
  update((p) => {
    const c = chapter(p, slug);
    if (!c.quiz || score >= c.quiz.score) c.quiz = { score, total, at: Date.now() };
  });
}

export function touch(slug: string) {
  update((p) => {
    chapter(p, slug).visitedAt = Date.now();
    p.last = slug;
  });
}

export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJson(text: string): boolean {
  try {
    const p = JSON.parse(text) as Progress;
    if (!p || p.v !== 1 || typeof p.chapters !== 'object') return false;
    save(p);
    return true;
  } catch {
    return false;
  }
}

export function resetAll() {
  save(empty());
}
