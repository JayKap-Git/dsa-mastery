import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: { en: 'How many inversions does [1, 2, 2, 6, 3, 5, 9, 8] have?', hi: '[1, 2, 2, 6, 3, 5, 9, 8] mein kitne inversions hain?' },
      options: ['3', '2', '4', '0'],
      answer: 0,
      explain: { en: '(6,3), (6,5) and (9,8). Bubble sort would need exactly 3 swaps.', hi: '(6,3), (6,5) aur (9,8). Bubble sort ko theek 3 swaps chahiye.' },
    },
    {
      kind: 'concept',
      q: { en: 'Why must any sort that only swaps neighbours be O(n²)?', hi: 'Sirf padosi swap karne wala har sort O(n²) kyun hai?' },
      options: [
        { en: 'Each swap removes at most one inversion, and there can be n(n−1)/2 of them', hi: 'Har swap max ek inversion hatata hai, aur n(n−1)/2 tak inversions ho sakte hain' },
        { en: 'Because it uses two nested loops', hi: 'Kyunki do nested loops hain' },
        { en: 'Because swapping is slow in Java', hi: 'Kyunki Java mein swap slow hai' },
        { en: 'It isn’t; some are O(n log n)', hi: 'Nahi hai; kuch O(n log n) hain' },
      ],
      answer: 0,
      explain: { en: 'A reversed array has n(n−1)/2 inversions, and each neighbour swap fixes only one.', hi: 'Reversed array mein n(n−1)/2 inversions; har padosi swap sirf ek theek karta hai.' },
    },
    {
      kind: 'concept',
      q: { en: 'How can counting sort run in O(n) when sorting has an n log n lower bound?', hi: 'Sorting ki n log n lower bound hai, phir counting sort O(n) kaise?' },
      options: [
        { en: 'The bound is only for comparison sorts, and counting sort never compares', hi: 'Bound sirf comparison sorts pe hai — counting sort compare hi nahi karta' },
        { en: 'It only works on already-sorted input', hi: 'Sirf already-sorted input pe chalta hai' },
        { en: 'It is actually O(n log n)', hi: 'Asal mein O(n log n) hai' },
        { en: 'It uses binary search', hi: 'Binary search use karta hai' },
      ],
      answer: 0,
      explain: { en: 'It indexes an array by value, so values must be small (0..c with c = O(n)).', hi: 'Value se array index karta hai, isliye values chhoti honi chahiye (0..c, c = O(n)).' },
    },
    {
      kind: 'java',
      q: { en: 'a = [1, 2, 2, 2, 5, 7, 9]. What are lowerBound(a, 2) and upperBound(a, 2)?', hi: 'a = [1, 2, 2, 2, 5, 7, 9]. lowerBound(a, 2) aur upperBound(a, 2) kya hain?' },
      options: ['1 and 4', '1 and 3', '2 and 4', '0 and 4'],
      answer: 0,
      explain: { en: 'The first index with a value ≥ 2 is 1; the first index with a value > 2 is 4. 4 − 1 = 3 copies of 2.', hi: '≥ 2 wala pehla index 1; > 2 wala pehla index 4. 4 − 1 = 3 baar 2.' },
    },
    {
      kind: 'java',
      q: { en: 'Arrays.binarySearch(new int[]{1, 3, 5}, 4) returns…', hi: 'Arrays.binarySearch(new int[]{1, 3, 5}, 4) kya deta hai?' },
      options: ['-3', '2', '-1', '1'],
      answer: 0,
      explain: { en: '4 is missing, and its insertion point is 2, so the result is -(2) - 1 = -3.', hi: '4 nahi hai; insertion point 2, toh -(2) - 1 = -3.' },
    },
    {
      kind: 'java',
      q: { en: 'What is wrong with Arrays.sort(arr, (p, q) -> p - q) on an Integer[]?', hi: 'Integer[] pe Arrays.sort(arr, (p, q) -> p - q) mein kya galat hai?' },
      options: [
        { en: 'p − q can overflow, so huge or negative values get the wrong order', hi: 'p − q overflow ho sakta hai — bahut badi/negative values ka order galat' },
        { en: 'Nothing; it is the standard idiom', hi: 'Kuch nahi; yahi standard tareeka hai' },
        { en: 'It sorts in descending order', hi: 'Descending sort karta hai' },
        { en: 'It does not compile', hi: 'Compile nahi hota' },
      ],
      answer: 0,
      explain: { en: 'Integer.MIN_VALUE − 1 wraps to Integer.MAX_VALUE. Use Integer.compare.', hi: 'Integer.MIN_VALUE − 1 ghoom ke Integer.MAX_VALUE ban jaata hai. Integer.compare use karo.' },
    },
    {
      kind: 'concept',
      q: { en: '"Minimum time T so that the machines make at least t products" is best solved with…', hi: '"Minimum time T jisme machines kam se kam t products banayein" — best tareeka?' },
      options: [
        { en: 'binary search on T with a check ok(T)', hi: 'T pe binary search, ok(T) check ke saath' },
        { en: 'sorting the machines only', hi: 'sirf machines ko sort karna' },
        { en: 'trying every T from 1 upwards', hi: '1 se har T try karna' },
        { en: 'counting sort', hi: 'counting sort' },
      ],
      answer: 0,
      explain: { en: 'ok(T) — can we make t products in time T — is false then true as T grows, so binary search finds the boundary.', hi: 'ok(T) — kya T time mein t products ban sakte hain — T badhne pe pehle false, phir true; binary search boundary dhundh leta hai.' },
    },
  ],

  practice: [
    { id: 1621, name: 'Distinct Numbers', level: 'easy', section: '3.1', note: { en: 'Sort, then count value changes. Shuffle before Arrays.sort.', hi: 'Sort karo, phir value badalne ki ginti. Arrays.sort se pehle shuffle.' } },
    { id: 1084, name: 'Apartments', level: 'easy', section: '3.2', note: { en: 'Sort both lists and match greedily with two pointers.', hi: 'Dono lists sort, phir two pointers se greedy match.' } },
    { id: 1090, name: 'Ferris Wheel', level: 'easy', section: '3.2', note: { en: 'Sort and pair the lightest with the heaviest.', hi: 'Sort karo, sabse halke ko sabse bhaari ke saath jodo.' } },
    { id: 1074, name: 'Stick Lengths', level: 'easy', section: '3.2', note: { en: 'Sort and move every stick to the median.', hi: 'Sort karo, har stick ko median pe le aao.' } },
    { id: 1640, name: 'Sum of Two Values', level: 'easy', section: '3.3', note: { en: 'Sort value–index pairs, then two pointers (or binary search).', hi: 'Value–index pairs sort, phir two pointers (ya binary search).' } },
    { id: 1620, name: 'Factory Machines', level: 'medium', section: '3.3', note: { en: 'Binary search on the time; ok(T) = Σ T/kᵢ ≥ t (watch overflow).', hi: 'Time pe binary search; ok(T) = Σ T/kᵢ ≥ t (overflow ka dhyaan).' } },
    { id: 1085, name: 'Array Division', level: 'medium', section: '3.3', note: { en: 'Binary search on the largest allowed group sum.', hi: 'Sabse bade allowed group sum pe binary search.' } },
  ],

  cheatsheet: [
    { title: 'Sort bounds', body: { en: 'Neighbour swaps → O(n²) (inversions). Comparison sorts ≥ n log n. Counting sort O(n + c) for small values.', hi: 'Padosi swaps → O(n²) (inversions). Comparison sorts ≥ n log n. Chhoti values pe counting sort O(n + c).' } },
    { title: 'Java sorting', body: { en: '`Arrays.sort(int[])`: shuffle first. Objects: TimSort, stable, O(n log n). Pairs: `int[][]` + comparator.', hi: '`Arrays.sort(int[])`: pehle shuffle. Objects: TimSort, stable, O(n log n). Pairs: `int[][]` + comparator.' } },
    { title: 'Comparators', body: { en: '`Comparator.comparingInt(f).thenComparing(g)`; `Integer.compare(a, b)`, never `a - b`.', hi: '`Comparator.comparingInt(f).thenComparing(g)`; `Integer.compare(a, b)`, kabhi `a - b` nahi.' } },
    { title: 'Bounds', body: { en: 'lowerBound = first ≥ x, upperBound = first > x; count = ub − lb. `Arrays.binarySearch` returns any match or `-(ins) - 1`.', hi: 'lowerBound = pehla ≥ x, upperBound = pehla > x; count = ub − lb. `Arrays.binarySearch` koi bhi match ya `-(ins) - 1`.' } },
    { title: 'On the answer', body: { en: 'Monotone `ok(x)`: jump with b = z, z/2, …, 1 while `!ok(x + b)`. The answer is x + 1.', hi: 'Monotone `ok(x)`: b = z, z/2, …, 1 se jump jab tak `!ok(x + b)`. Answer x + 1.' } },
  ],

  flashcards: [
    { front: { en: 'What is an inversion?', hi: 'Inversion kya hai?' }, back: { en: 'A pair i < j with a[i] > a[j]. Sorted ⇔ zero inversions.', hi: 'Pair i < j jahan a[i] > a[j]. Sorted ⇔ zero inversions.' } },
    { front: { en: 'Why is merge sort O(n log n)?', hi: 'Merge sort O(n log n) kyun?' }, back: { en: 'log n levels of halving, with O(n) merging per level.', hi: 'Halving ke log n levels, har level pe O(n) merging.' } },
    { front: { en: 'Java equivalent of C++ lower_bound on an array?', hi: 'Array pe C++ lower_bound ka Java equivalent?' }, back: { en: 'Write lowerBound yourself; Arrays.binarySearch differs with duplicates.', hi: 'lowerBound khud likho — duplicates mein Arrays.binarySearch alag hai.' } },
    { front: { en: 'Safe way to sort an int[] against hacks?', hi: 'Hacks se bach ke int[] sort kaise?' }, back: { en: 'Shuffle, then Arrays.sort, or sort a long[] / Integer[].', hi: 'Shuffle, phir Arrays.sort — ya long[] / Integer[] sort karo.' } },
    { front: { en: 'When does binary search on the answer work?', hi: 'Answer pe binary search kab chalta hai?' }, back: { en: 'When ok(x) is monotone: false…false, true…true.', hi: 'Jab ok(x) monotone ho: false…false, true…true.' } },
  ],
};

export default extras;
