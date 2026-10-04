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
  { chapter: 5, section: '5.1', title: { en: 'Generating subsets and permutations', hi: 'Subsets aur permutations generate karna' }, shows: { en: 'The recursion tree, bitmasks, and the chosen[] search, step by step.', hi: 'Recursion tree, bitmasks, aur chosen[] wala search, step by step.' } },
  { chapter: 5, section: '5.3', title: { en: 'n queens backtracking', hi: 'n queens backtracking' }, shows: { en: 'Place, check, backtrack: watch the board, the attacks and the solution count.', hi: 'Rakho, check karo, backtrack — board, attacks aur solutions dekho.' } },
  { chapter: 5, section: '5.4', title: { en: 'Pruning lab: grid paths', hi: 'Pruning lab: grid paths' }, shows: { en: 'Run all five optimisation levels and compare the recursive calls.', hi: 'Paanchon optimisation levels chalao aur recursive calls compare karo.' } },
  { chapter: 5, section: '5.5', title: { en: 'Meet in the middle', hi: 'Meet in the middle' }, shows: { en: 'Two halves, two sorted lists of sums, and a two-pointer search.', hi: 'Do halves, sums ki do sorted lists, aur two-pointer search.' } },
  { chapter: 6, section: '6.1', title: { en: 'Greedy coins', hi: 'Greedy coins' }, shows: { en: 'Largest coin first vs the true optimum: euro coins and the {1,3,4} counterexample.', hi: 'Sabse bada coin pehle vs asli optimum: euro coins aur {1,3,4} counterexample.' } },
  { chapter: 6, section: '6.2', title: { en: 'Scheduling strategies', hi: 'Scheduling strategies' }, shows: { en: 'Three greedy rules on a timeline: two fail, earliest end always works.', hi: 'Timeline pe teen greedy rules: do fail, earliest end hamesha chalta hai.' } },
  { chapter: 6, section: '6.3', title: { en: 'The exchange argument', hi: 'Exchange argument' }, shows: { en: 'Swap out-of-order neighbours and watch the score only go up.', hi: 'Galat order wale padosi swap karo aur score sirf badhta dekho.' } },
  { chapter: 6, section: '6.4', title: { en: 'Median vs mean', hi: 'Median vs mean' }, shows: { en: 'Slide x and see where Σ|a − x| and Σ(a − x)² bottom out.', hi: 'x khiskao aur dekho Σ|a − x| aur Σ(a − x)² kahan sabse neeche hain.' } },
  { chapter: 6, section: '6.5', title: { en: 'Huffman coding', hi: 'Huffman coding' }, shows: { en: 'Merge the two lightest trees until one is left, then read the codewords.', hi: 'Do sabse halke trees jodo jab tak ek na bache, phir codewords padho.' } },
  { chapter: 7, section: '7.1', title: { en: 'Coin DP: fewest coins and number of ways', hi: 'Coin DP: kam se kam coins aur tareeke' }, shows: { en: 'Fill value[x] bottom-up, then follow first[] back to the coins.', hi: 'value[x] bottom-up bharo, phir first[] se coins tak wapas jao.' } },
  { chapter: 7, section: '7.2', title: { en: 'Longest increasing subsequence', hi: 'Longest increasing subsequence' }, shows: { en: 'length[k] from every earlier smaller element, then the chain.', hi: 'Har pichhle chhote element se length[k], phir chain.' } },
  { chapter: 7, section: '7.3', title: { en: 'Grid path DP', hi: 'Grid path DP' }, shows: { en: 'Best sum from the left or from above, then the best path traced back.', hi: 'Left ya upar se best sum, phir best path peeche se.' } },
  { chapter: 7, section: '7.4', title: { en: 'Knapsack table', hi: 'Knapsack table' }, shows: { en: 'possible[k][x]: use the weight or skip it.', hi: 'possible[k][x]: weight use karo ya skip.' } },
  { chapter: 7, section: '7.5', title: { en: 'Edit distance table', hi: 'Edit distance table' }, shows: { en: 'Insert, remove, match/modify, plus the operations read off the table.', hi: 'Insert, remove, match/modify — aur table se operations.' } },
  { chapter: 7, section: '7.6', title: { en: 'Counting domino tilings', hi: 'Domino tilings ginna' }, shows: { en: 'Row-by-row bitmask states, with an example tiling.', hi: 'Row-by-row bitmask states, ek example tiling ke saath.' } },
  { chapter: 9, section: '9.1', title: { en: 'Prefix sum array', hi: 'Prefix sum array' }, shows: { en: 'Build p in one pass, then answer sumq(a, b) with two lookups.', hi: 'Ek pass mein p banao, phir do lookups se sumq(a, b).' } },
  { chapter: 9, section: '9.1', title: { en: '2D prefix sums', hi: '2D prefix sums' }, shows: { en: 'Inclusion–exclusion on rectangles: S(A) − S(B) − S(C) + S(D).', hi: 'Rectangles pe inclusion–exclusion: S(A) − S(B) − S(C) + S(D).' } },
  { chapter: 9, section: '9.1', title: { en: 'Sparse table', hi: 'Sparse table' }, shows: { en: 'Power-of-two blocks and the overlapping O(1) min query.', hi: 'Power-of-two blocks aur overlapping O(1) min query.' } },
  { chapter: 9, section: '9.2', title: { en: 'Fenwick tree', hi: 'Fenwick tree' }, shows: { en: 'sum and add walking with k & −k, with the stored ranges drawn as bars.', hi: 'k & −k se sum aur add ka chalna, stored ranges bars mein.' } },
  { chapter: 9, section: '9.3', title: { en: 'Segment tree', hi: 'Segment tree' }, shows: { en: 'Bottom-up build, range query, point update and argmin, for sum or min.', hi: 'Bottom-up build, range query, point update aur argmin — sum ya min.' } },
  { chapter: 9, section: '9.4', title: { en: 'Index compression', hi: 'Index compression' }, shows: { en: 'Sort, dedupe and map huge values to ranks 1, 2, 3, …', hi: 'Sort, dedupe aur badi values ko rank 1, 2, 3, … mein badlo.' } },
  { chapter: 9, section: '9.4', title: { en: 'Difference array', hi: 'Difference array' }, shows: { en: 'A whole range update with just two writes.', hi: 'Sirf do writes mein poori range ka update.' } },
];
