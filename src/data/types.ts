import type { Bi } from '../viz/engine/types';

export interface QuizQuestion {
  kind: 'concept' | 'trace' | 'complexity' | 'java';
  q: Bi;
  /** Optional Java/pseudo snippet shown under the question. */
  code?: string;
  options: (Bi | string)[];
  answer: number; // index into options
  explain: Bi;
}

export interface PracticeProblem {
  /** CSES task id — checked against src/data/cses.json at build time. */
  id: number;
  name: string;
  level: 'easy' | 'medium' | 'hard';
  section: string; // book section it practises, e.g. "9.3"
  note: Bi;
}

export interface CheatItem {
  title: string;
  body: Bi;
}

export interface Flashcard {
  front: Bi;
  back: Bi;
}

export interface ChapterExtras {
  quiz: QuizQuestion[];
  practice: PracticeProblem[];
  cheatsheet: CheatItem[];
  flashcards: Flashcard[];
}
