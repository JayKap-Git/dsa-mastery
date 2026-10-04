import type { Bi } from '../viz/engine/types';

/** Every visualiser, for the /playground index. `section` links to the chapter section that embeds it. */
export interface VizEntry {
  chapter: number;
  section: string;
  title: Bi;
  shows: Bi;
}

export const VISUALIZERS: VizEntry[] = [
  { chapter: 9, section: '9.1', title: { en: 'Prefix sum array', hi: 'Prefix sum array' }, shows: { en: 'Build p in one pass, then answer sumq(a, b) with two lookups.', hi: 'Ek pass mein p banao, phir do lookups se sumq(a, b).' } },
  { chapter: 9, section: '9.1', title: { en: '2D prefix sums', hi: '2D prefix sums' }, shows: { en: 'Inclusion–exclusion on rectangles: S(A) − S(B) − S(C) + S(D).', hi: 'Rectangles pe inclusion–exclusion: S(A) − S(B) − S(C) + S(D).' } },
  { chapter: 9, section: '9.1', title: { en: 'Sparse table', hi: 'Sparse table' }, shows: { en: 'Power-of-two blocks and the overlapping O(1) min query.', hi: 'Power-of-two blocks aur overlapping O(1) min query.' } },
  { chapter: 9, section: '9.2', title: { en: 'Fenwick tree', hi: 'Fenwick tree' }, shows: { en: 'sum and add walking with k & −k, with the stored ranges drawn as bars.', hi: 'k & −k se sum aur add ka chalna, stored ranges bars mein.' } },
  { chapter: 9, section: '9.3', title: { en: 'Segment tree', hi: 'Segment tree' }, shows: { en: 'Bottom-up build, range query, point update and argmin, for sum or min.', hi: 'Bottom-up build, range query, point update aur argmin — sum ya min.' } },
  { chapter: 9, section: '9.4', title: { en: 'Index compression', hi: 'Index compression' }, shows: { en: 'Sort, dedupe and map huge values to ranks 1, 2, 3, …', hi: 'Sort, dedupe aur badi values ko rank 1, 2, 3, … mein badlo.' } },
  { chapter: 9, section: '9.4', title: { en: 'Difference array', hi: 'Difference array' }, shows: { en: 'A whole range update with just two writes.', hi: 'Sirf do writes mein poori range ka update.' } },
];
