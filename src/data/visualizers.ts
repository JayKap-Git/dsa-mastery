import type { Bi } from '../viz/engine/types';

/** Every visualiser, for the /playground index. `section` links to the chapter section that embeds it. */
export interface VizEntry {
  chapter: number;
  section: string;
  title: Bi;
  shows: Bi;
}

export const VISUALIZERS: VizEntry[] = [
  { chapter: 1, section: '1.3', title: { en: 'Overflow and modulo lab', hi: 'Overflow aur modulo lab' }, shows: { en: 'What Java’s int and long really compute, and % vs Math.floorMod.', hi: 'Java ke int aur long asal mein kya calculate karte hain, aur % vs Math.floorMod.' } },
  { chapter: 2, section: '2.3', title: { en: 'Will it run in time?', hi: 'Kya time limit mein chalega?' }, shows: { en: 'Slide n and watch each complexity class pass or fail a 1-second limit.', hi: 'n badlo aur dekho kaunsi complexity 1 second mein chalti hai.' } },
  { chapter: 2, section: '2.4', title: { en: 'Kadane’s algorithm', hi: 'Kadane ka algorithm' }, shows: { en: 'Maximum subarray sum in one pass: extend or restart at every element.', hi: 'Ek pass mein maximum subarray sum: har element pe extend ya restart.' } },
  { chapter: 3, section: '3.1', title: { en: 'Bubble, merge and counting sort', hi: 'Bubble, merge aur counting sort' }, shows: { en: 'Swaps = inversions, halving and merging, and sorting without comparisons.', hi: 'Swaps = inversions, halving aur merging, aur bina compare kiye sorting.' } },
  { chapter: 3, section: '3.3', title: { en: 'Binary search, three ways', hi: 'Binary search, teen tareeke' }, shows: { en: 'Halving, jumping and lowerBound on the same sorted array.', hi: 'Ek hi sorted array pe halving, jumping aur lowerBound.' } },
  { chapter: 4, section: '4.4', title: { en: 'TreeSet navigation lab', hi: 'TreeSet navigation lab' }, shows: { en: 'ceiling, higher, floor, lower and nearest: Java’s answer to C++ iterators.', hi: 'ceiling, higher, floor, lower aur nearest — C++ iterators ka Java jawab.' } },
  { chapter: 9, section: '9.1', title: { en: 'Prefix sum array', hi: 'Prefix sum array' }, shows: { en: 'Build p in one pass, then answer sumq(a, b) with two lookups.', hi: 'Ek pass mein p banao, phir do lookups se sumq(a, b).' } },
  { chapter: 9, section: '9.1', title: { en: '2D prefix sums', hi: '2D prefix sums' }, shows: { en: 'Inclusion–exclusion on rectangles: S(A) − S(B) − S(C) + S(D).', hi: 'Rectangles pe inclusion–exclusion: S(A) − S(B) − S(C) + S(D).' } },
  { chapter: 9, section: '9.1', title: { en: 'Sparse table', hi: 'Sparse table' }, shows: { en: 'Power-of-two blocks and the overlapping O(1) min query.', hi: 'Power-of-two blocks aur overlapping O(1) min query.' } },
  { chapter: 9, section: '9.2', title: { en: 'Fenwick tree', hi: 'Fenwick tree' }, shows: { en: 'sum and add walking with k & −k, with the stored ranges drawn as bars.', hi: 'k & −k se sum aur add ka chalna, stored ranges bars mein.' } },
  { chapter: 9, section: '9.3', title: { en: 'Segment tree', hi: 'Segment tree' }, shows: { en: 'Bottom-up build, range query, point update and argmin, for sum or min.', hi: 'Bottom-up build, range query, point update aur argmin — sum ya min.' } },
  { chapter: 9, section: '9.4', title: { en: 'Index compression', hi: 'Index compression' }, shows: { en: 'Sort, dedupe and map huge values to ranks 1, 2, 3, …', hi: 'Sort, dedupe aur badi values ko rank 1, 2, 3, … mein badlo.' } },
  { chapter: 9, section: '9.4', title: { en: 'Difference array', hi: 'Difference array' }, shows: { en: 'A whole range update with just two writes.', hi: 'Sirf do writes mein poori range ka update.' } },
];
