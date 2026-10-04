import type { Bi } from '../viz/engine/types';

export interface SectionMeta {
  id: string; // book numbering, e.g. "9.3"
  title: string;
}

export interface ChapterMeta {
  num: number;
  slug: string;
  title: string;
  part: 1 | 2 | 3;
  pages: [number, number]; // book page range
  condensed?: boolean; // ch 1–4: quick-revision format
  blurb: Bi;
  sections: SectionMeta[];
}

export const PARTS: Record<1 | 2 | 3, { title: string; blurb: Bi }> = {
  1: {
    title: 'Basic techniques',
    blurb: {
      en: 'The toolkit every contest problem builds on: complexity, sorting, search, greedy, DP and range queries.',
      hi: 'Har contest problem ki neev yahi hai — complexity, sorting, search, greedy, DP aur range queries.',
    },
  },
  2: {
    title: 'Graph algorithms',
    blurb: {
      en: 'Traversals, shortest paths, trees, connectivity, matching and flows.',
      hi: 'Graph ko explore karna, shortest path nikalna, trees, connectivity, matching aur flows.',
    },
  },
  3: {
    title: 'Advanced topics',
    blurb: {
      en: 'Number theory, combinatorics, strings, sqrt tricks, advanced segment trees and geometry.',
      hi: 'Number theory, combinatorics, strings, sqrt tricks, advanced segment trees aur geometry.',
    },
  },
};

const s = (id: string, title: string): SectionMeta => ({ id, title });

export const CHAPTERS: ChapterMeta[] = [
  {
    num: 1, slug: 'introduction', title: 'Introduction', part: 1, pages: [3, 16], condensed: true,
    blurb: { en: 'Java for competitive programming: fast I/O, overflow, modular arithmetic and the maths you need.', hi: 'CP ke liye Java setup: fast I/O, overflow se bachna, modulo aur zaroori maths.' },
    sections: [s('1.1', 'Programming languages'), s('1.2', 'Input and output'), s('1.3', 'Working with numbers'), s('1.4', 'Shortening code'), s('1.5', 'Mathematics'), s('1.6', 'Contests and resources')],
  },
  {
    num: 2, slug: 'time-complexity', title: 'Time complexity', part: 1, pages: [17, 24], condensed: true,
    blurb: { en: 'Estimate whether an idea is fast enough before you write a single line.', hi: 'Code likhne se pehle hi pata karo ki idea time limit mein chalega ya nahi.' },
    sections: [s('2.1', 'Calculation rules'), s('2.2', 'Complexity classes'), s('2.3', 'Estimating efficiency'), s('2.4', 'Maximum subarray sum')],
  },
  {
    num: 3, slug: 'sorting', title: 'Sorting', part: 1, pages: [25, 34], condensed: true,
    blurb: { en: 'Sorting theory, sorting in Java, and binary search as a problem-solving tool.', hi: 'Sorting ki theory, Java mein sorting, aur binary search ko tool ki tarah use karna.' },
    sections: [s('3.1', 'Sorting theory'), s('3.2', 'Sorting in Java'), s('3.3', 'Binary search')],
  },
  {
    num: 4, slug: 'data-structures', title: 'Data structures', part: 1, pages: [35, 46], condensed: true,
    blurb: { en: 'The Java Collections you will use daily, mapped from the C++ STL.', hi: 'Roz kaam aane wale Java Collections — C++ STL ke equivalent ke saath.' },
    sections: [s('4.1', 'Dynamic arrays'), s('4.2', 'Set structures'), s('4.3', 'Map structures'), s('4.4', 'Iterators and ranges'), s('4.5', 'Other structures'), s('4.6', 'Comparison to sorting')],
  },
  {
    num: 5, slug: 'complete-search', title: 'Complete search', part: 1, pages: [47, 56],
    blurb: { en: 'Generate every candidate, then prune the search until it is fast enough.', hi: 'Saare possible answers generate karo, phir pruning se search ko fast banao.' },
    sections: [s('5.1', 'Generating subsets'), s('5.2', 'Generating permutations'), s('5.3', 'Backtracking'), s('5.4', 'Pruning the search'), s('5.5', 'Meet in the middle')],
  },
  {
    num: 6, slug: 'greedy-algorithms', title: 'Greedy algorithms', part: 1, pages: [57, 64],
    blurb: { en: 'When the locally best choice is globally optimal — and how to prove it.', hi: 'Kab har step pe best choice lena overall best answer deta hai — aur ise prove kaise karein.' },
    sections: [s('6.1', 'Coin problem'), s('6.2', 'Scheduling'), s('6.3', 'Tasks and deadlines'), s('6.4', 'Minimizing sums'), s('6.5', 'Data compression')],
  },
  {
    num: 7, slug: 'dynamic-programming', title: 'Dynamic programming', part: 1, pages: [65, 76],
    blurb: { en: 'Break a problem into overlapping subproblems and solve each exactly once.', hi: 'Problem ko overlapping subproblems mein todo aur har ek ko sirf ek baar solve karo.' },
    sections: [s('7.1', 'Coin problem'), s('7.2', 'Longest increasing subsequence'), s('7.3', 'Paths in a grid'), s('7.4', 'Knapsack problems'), s('7.5', 'Edit distance'), s('7.6', 'Counting tilings')],
  },
  {
    num: 8, slug: 'amortized-analysis', title: 'Amortized analysis', part: 1, pages: [77, 82],
    blurb: { en: 'Two pointers, monotonic stacks and sliding windows: cheap on average, even if one step is costly.', hi: 'Two pointers, monotonic stack aur sliding window — ek step mehenga ho sakta hai, par average sasta.' },
    sections: [s('8.1', 'Two pointers method'), s('8.2', 'Nearest smaller elements'), s('8.3', 'Sliding window minimum')],
  },
  {
    num: 9, slug: 'range-queries', title: 'Range queries', part: 1, pages: [83, 94],
    blurb: { en: 'Prefix sums, sparse tables, Fenwick trees and segment trees for fast queries on subarrays.', hi: 'Subarray pe fast queries ke liye prefix sums, sparse table, Fenwick tree aur segment tree.' },
    sections: [s('9.1', 'Static array queries'), s('9.2', 'Binary indexed tree'), s('9.3', 'Segment tree'), s('9.4', 'Additional techniques')],
  },
  {
    num: 10, slug: 'bit-manipulation', title: 'Bit manipulation', part: 1, pages: [95, 106],
    blurb: { en: 'Integers as bit strings: tricks, sets as bitmasks and DP over subsets.', hi: 'Numbers ko bits ki tarah socho: tricks, bitmask se sets, aur subsets pe DP.' },
    sections: [s('10.1', 'Bit representation'), s('10.2', 'Bit operations'), s('10.3', 'Representing sets'), s('10.4', 'Bit optimizations'), s('10.5', 'Dynamic programming')],
  },
  {
    num: 11, slug: 'basics-of-graphs', title: 'Basics of graphs', part: 2, pages: [109, 116],
    blurb: { en: 'Graph vocabulary and the three ways to store a graph in code.', hi: 'Graph ki basic terms aur code mein graph store karne ke teen tareeke.' },
    sections: [s('11.1', 'Graph terminology'), s('11.2', 'Graph representation')],
  },
  {
    num: 12, slug: 'graph-traversal', title: 'Graph traversal', part: 2, pages: [117, 122],
    blurb: { en: 'Depth-first and breadth-first search, and what they let you check.', hi: 'DFS aur BFS — aur inse kya-kya check kar sakte hain.' },
    sections: [s('12.1', 'Depth-first search'), s('12.2', 'Breadth-first search'), s('12.3', 'Applications')],
  },
  {
    num: 13, slug: 'shortest-paths', title: 'Shortest paths', part: 2, pages: [123, 132],
    blurb: { en: 'Bellman–Ford, Dijkstra and Floyd–Warshall, and when to use each one.', hi: 'Bellman–Ford, Dijkstra aur Floyd–Warshall — kaunsa kab use karna hai.' },
    sections: [s('13.1', 'Bellman–Ford algorithm'), s('13.2', "Dijkstra's algorithm"), s('13.3', 'Floyd–Warshall algorithm')],
  },
  {
    num: 14, slug: 'tree-algorithms', title: 'Tree algorithms', part: 2, pages: [133, 140],
    blurb: { en: 'Traversals, diameters and longest paths from every node.', hi: 'Tree traversal, diameter, aur har node se longest path.' },
    sections: [s('14.1', 'Tree traversal'), s('14.2', 'Diameter'), s('14.3', 'All longest paths'), s('14.4', 'Binary trees')],
  },
  {
    num: 15, slug: 'spanning-trees', title: 'Spanning trees', part: 2, pages: [141, 148],
    blurb: { en: "Minimum spanning trees with Kruskal's and Prim's algorithms, plus union-find.", hi: 'Kruskal aur Prim se minimum spanning tree, saath mein union-find.' },
    sections: [s('15.1', "Kruskal's algorithm"), s('15.2', 'Union-find structure'), s('15.3', "Prim's algorithm")],
  },
  {
    num: 16, slug: 'directed-graphs', title: 'Directed graphs', part: 2, pages: [149, 156],
    blurb: { en: 'Topological order, DP on DAGs, successor graphs and cycle detection.', hi: 'Topological order, DAG pe DP, successor graphs aur cycle detection.' },
    sections: [s('16.1', 'Topological sorting'), s('16.2', 'Dynamic programming'), s('16.3', 'Successor paths'), s('16.4', 'Cycle detection')],
  },
  {
    num: 17, slug: 'strong-connectivity', title: 'Strong connectivity', part: 2, pages: [157, 162],
    blurb: { en: "Strongly connected components with Kosaraju's algorithm, and 2SAT.", hi: 'Kosaraju se strongly connected components, aur 2SAT problem.' },
    sections: [s('17.1', "Kosaraju's algorithm"), s('17.2', '2SAT problem')],
  },
  {
    num: 18, slug: 'tree-queries', title: 'Tree queries', part: 2, pages: [163, 172],
    blurb: { en: 'Ancestors, subtree and path queries, and lowest common ancestors.', hi: 'Ancestors, subtree aur path queries, aur lowest common ancestor.' },
    sections: [s('18.1', 'Finding ancestors'), s('18.2', 'Subtrees and paths'), s('18.3', 'Lowest common ancestor'), s('18.4', 'Offline algorithms')],
  },
  {
    num: 19, slug: 'paths-and-circuits', title: 'Paths and circuits', part: 2, pages: [173, 180],
    blurb: { en: "Eulerian and Hamiltonian paths, De Bruijn sequences and knight's tours.", hi: "Eulerian aur Hamiltonian paths, De Bruijn sequence aur knight's tour." },
    sections: [s('19.1', 'Eulerian paths'), s('19.2', 'Hamiltonian paths'), s('19.3', 'De Bruijn sequences'), s('19.4', "Knight's tours")],
  },
  {
    num: 20, slug: 'flows-and-cuts', title: 'Flows and cuts', part: 2, pages: [181, 194],
    blurb: { en: 'Maximum flow, minimum cut, disjoint paths, matchings and path covers.', hi: 'Maximum flow, minimum cut, disjoint paths, matching aur path covers.' },
    sections: [s('20.1', 'Ford–Fulkerson algorithm'), s('20.2', 'Disjoint paths'), s('20.3', 'Maximum matchings'), s('20.4', 'Path covers')],
  },
  {
    num: 21, slug: 'number-theory', title: 'Number theory', part: 3, pages: [197, 206],
    blurb: { en: 'Primes, gcd, modular arithmetic and solving equations with integers.', hi: 'Primes, gcd, modular arithmetic aur integer equations solve karna.' },
    sections: [s('21.1', 'Primes and factors'), s('21.2', 'Modular arithmetic'), s('21.3', 'Solving equations'), s('21.4', 'Other results')],
  },
  {
    num: 22, slug: 'combinatorics', title: 'Combinatorics', part: 3, pages: [207, 216],
    blurb: { en: 'Counting without listing: binomials, Catalan numbers, inclusion–exclusion and Burnside.', hi: 'Bina list kiye ginna: binomials, Catalan numbers, inclusion–exclusion aur Burnside.' },
    sections: [s('22.1', 'Binomial coefficients'), s('22.2', 'Catalan numbers'), s('22.3', 'Inclusion-exclusion'), s('22.4', "Burnside's lemma"), s('22.5', "Cayley's formula")],
  },
  {
    num: 23, slug: 'matrices', title: 'Matrices', part: 3, pages: [217, 224],
    blurb: { en: 'Matrix power for linear recurrences and counting paths in graphs.', hi: 'Matrix power se linear recurrences aur graph mein paths count karna.' },
    sections: [s('23.1', 'Operations'), s('23.2', 'Linear recurrences'), s('23.3', 'Graphs and matrices')],
  },
  {
    num: 24, slug: 'probability', title: 'Probability', part: 3, pages: [225, 234],
    blurb: { en: 'Expected values, Markov chains and randomized algorithms.', hi: 'Expected value, Markov chains aur randomized algorithms.' },
    sections: [s('24.1', 'Calculation'), s('24.2', 'Events'), s('24.3', 'Random variables'), s('24.4', 'Markov chains'), s('24.5', 'Randomized algorithms')],
  },
  {
    num: 25, slug: 'game-theory', title: 'Game theory', part: 3, pages: [235, 242],
    blurb: { en: 'Winning and losing states, Nim, and Grundy numbers.', hi: 'Winning aur losing states, Nim game, aur Grundy numbers.' },
    sections: [s('25.1', 'Game states'), s('25.2', 'Nim game'), s('25.3', 'Sprague–Grundy theorem')],
  },
  {
    num: 26, slug: 'string-algorithms', title: 'String algorithms', part: 3, pages: [243, 250],
    blurb: { en: 'Tries, polynomial hashing and the Z-algorithm.', hi: 'Trie, polynomial hashing aur Z-algorithm.' },
    sections: [s('26.1', 'String terminology'), s('26.2', 'Trie structure'), s('26.3', 'String hashing'), s('26.4', 'Z-algorithm')],
  },
  {
    num: 27, slug: 'square-root-algorithms', title: 'Square root algorithms', part: 3, pages: [251, 256],
    blurb: { en: "Split work into √n blocks; Mo's algorithm for offline queries.", hi: "Kaam ko √n blocks mein baanto; offline queries ke liye Mo's algorithm." },
    sections: [s('27.1', 'Combining algorithms'), s('27.2', 'Integer partitions'), s('27.3', "Mo's algorithm")],
  },
  {
    num: 28, slug: 'segment-trees-revisited', title: 'Segment trees revisited', part: 3, pages: [257, 264],
    blurb: { en: 'Lazy propagation, dynamic and persistent trees, and 2D segment trees.', hi: 'Lazy propagation, dynamic aur persistent trees, aur 2D segment tree.' },
    sections: [s('28.1', 'Lazy propagation'), s('28.2', 'Dynamic trees'), s('28.3', 'Data structures'), s('28.4', 'Two-dimensionality')],
  },
  {
    num: 29, slug: 'geometry', title: 'Geometry', part: 3, pages: [265, 274],
    blurb: { en: 'Points and lines with cross products, polygon area and distance functions.', hi: 'Cross product se points aur lines, polygon area aur distance functions.' },
    sections: [s('29.1', 'Complex numbers'), s('29.2', 'Points and lines'), s('29.3', 'Polygon area'), s('29.4', 'Distance functions')],
  },
  {
    num: 30, slug: 'sweep-line-algorithms', title: 'Sweep line algorithms', part: 3, pages: [275, 280],
    blurb: { en: 'Sweep across the plane to find intersections, the closest pair and the convex hull.', hi: 'Plane pe line sweep karke intersections, closest pair aur convex hull nikalna.' },
    sections: [s('30.1', 'Intersection points'), s('30.2', 'Closest pair problem'), s('30.3', 'Convex hull problem')],
  },
];

export const chapterBySlug = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
export const chapterByNum = (num: number) => CHAPTERS.find((c) => c.num === num);
export const sectionAnchor = (id: string) => `s${id.replace('.', '-')}`;
