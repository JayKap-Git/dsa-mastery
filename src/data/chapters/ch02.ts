import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'complexity',
      q: { en: 'What is the time complexity of this loop?', hi: 'Is loop ki time complexity kya hai?' },
      code: 'for (int i = 1; i <= n; i += 2) {\n    // O(1) work\n}',
      options: ['O(n)', 'O(n/2)', 'O(log n)', 'O(n²)'],
      answer: 0,
      explain: { en: 'It runs ⌈n/2⌉ times; constants are dropped, so O(n). "O(n/2)" is not a different class.', hi: 'Yeh ⌈n/2⌉ baar chalta hai; constants hata do — O(n). "O(n/2)" alag class nahi hai.' },
    },
    {
      kind: 'complexity',
      q: { en: 'An algorithm has three phases: O(n), then O(n²), then O(n). Total?', hi: 'Algorithm ke teen phases: O(n), phir O(n²), phir O(n). Total?' },
      options: ['O(n²)', 'O(n⁴)', 'O(n + n² + n)', 'O(n³)'],
      answer: 0,
      explain: { en: 'Consecutive phases cost as much as the slowest phase.', hi: 'Ek ke baad ek phases ka cost sabse slow phase jitna.' },
    },
    {
      kind: 'complexity',
      q: { en: 'g(n) calls g(n − 1) twice (and stops at n = 1). Its complexity?', hi: 'g(n), g(n − 1) ko do baar call karta hai (n = 1 pe rukta hai). Complexity?' },
      options: ['O(2ⁿ)', 'O(n)', 'O(n²)', 'O(n log n)'],
      answer: 0,
      explain: { en: 'The calls double per level: 1 + 2 + … + 2ⁿ⁻¹ = 2ⁿ − 1.', hi: 'Har level pe calls double: 1 + 2 + … + 2ⁿ⁻¹ = 2ⁿ − 1.' },
    },
    {
      kind: 'complexity',
      q: { en: 'n = 10⁵ and the time limit is 1 second. Which complexity is the problem most likely expecting?', hi: 'n = 10⁵ aur time limit 1 second. Problem kaunsi complexity expect kar rahi hogi?' },
      options: ['O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'],
      answer: 0,
      explain: { en: 'O(n²) would be 10¹⁰ operations, far too many. O(n log n) is about 1.7·10⁶.', hi: 'O(n²) = 10¹⁰ operations — bahut zyada. O(n log n) ≈ 1.7·10⁶.' },
    },
    {
      kind: 'trace',
      q: { en: 'Kadane on [2, −5, 3, 4, −1]: what is sum after each element, and the answer?', hi: '[2, −5, 3, 4, −1] pe Kadane: har element ke baad sum kya, aur answer?' },
      options: ['2, −3, 3, 7, 6 → 7', '2, −3, 0, 4, 3 → 4', '2, 0, 3, 7, 6 → 7', '2, −3, 3, 7, 6 → 9'],
      answer: 0,
      explain: { en: 'At 3, max(3, −3 + 3) = 3 restarts; then 7, then 6. The best seen is 7.', hi: '3 pe max(3, −3 + 3) = 3 — naya start; phir 7, phir 6. Best = 7.' },
    },
    {
      kind: 'concept',
      q: { en: 'n ≤ 20 in a problem usually hints at…', hi: 'Problem mein n ≤ 20 aksar kis taraf ishaara karta hai?' },
      options: [
        { en: 'trying all subsets, O(2ⁿ)', hi: 'saare subsets try karna, O(2ⁿ)' },
        { en: 'a formula, O(1)', hi: 'formula, O(1)' },
        { en: 'sorting, O(n log n)', hi: 'sorting, O(n log n)' },
        { en: 'nothing; limits are random', hi: 'kuch nahi; limits random hoti hain' },
      ],
      answer: 0,
      explain: { en: '2²⁰ ≈ 10⁶ subsets is comfortable. Small limits are a deliberate signal.', hi: '2²⁰ ≈ 10⁶ subsets aaram se chal jaate hain. Chhoti limits jaan-boojh ke diya gaya ishaara hain.' },
    },
  ],

  practice: [
    { id: 1643, name: 'Maximum Subarray Sum', level: 'easy', section: '2.4', note: { en: 'Kadane, but the subarray must be non-empty: start best at a[0].', hi: 'Kadane, par subarray non-empty: best a[0] se shuru karo.' } },
    { id: 1070, name: 'Permutations', level: 'easy', section: '2.3', note: { en: 'n up to 10⁶: an O(n) construction, so think before brute force.', hi: 'n 10⁶ tak: O(n) construction chahiye — brute force se pehle socho.' } },
    { id: 1072, name: 'Two Knights', level: 'medium', section: '2.3', note: { en: 'O(1) formula per k: total pairs minus attacking pairs.', hi: 'Har k ke liye O(1) formula: total pairs minus attack karne wale pairs.' } },
    { id: 1092, name: 'Two Sets', level: 'medium', section: '2.3', note: { en: 'Greedy from the largest number, O(n). Check the sum first.', hi: 'Sabse bade number se greedy, O(n). Pehle sum check karo.' } },
  ],

  cheatsheet: [
    { title: 'Rules', body: { en: 'k nested loops → O(nᵏ). Drop constants. Phases → the slowest phase wins. Recursion → calls × cost per call.', hi: 'k nested loops → O(nᵏ). Constants hatao. Phases → sabse slow jeet-ta hai. Recursion → calls × har call ka cost.' } },
    { title: 'Limits → complexity', body: { en: 'n ≤ 10: n!; ≤ 20: 2ⁿ; ≤ 500: n³; ≤ 5000: n²; ≤ 10⁶: n log n or n; bigger: log n or 1.', hi: 'n ≤ 10: n!; ≤ 20: 2ⁿ; ≤ 500: n³; ≤ 5000: n²; ≤ 10⁶: n log n ya n; usse bada: log n ya 1.' } },
    { title: '10⁸ per second', body: { en: 'Plug n into the complexity. Up to ~10⁸ operations is comfortable; 10⁹ is risky in Java.', hi: 'Complexity mein n daalo. ~10⁸ operations tak aaram; Java mein 10⁹ risky.' } },
    { title: 'Kadane', body: { en: '`sum = max(a[k], sum + a[k]); best = max(best, sum);` gives O(n). For a non-empty subarray, start best at `a[0]`.', hi: '`sum = max(a[k], sum + a[k]); best = max(best, sum);` — O(n). Non-empty ke liye best `a[0]` se.' } },
  ],

  flashcards: [
    { front: { en: 'Why is a loop with j from i+1 to n still O(n²)?', hi: 'j = i+1 se n tak wala loop O(n²) kyun?' }, back: { en: 'It runs n(n−1)/2 times. Halving is just a constant.', hi: 'Yeh n(n−1)/2 baar chalta hai — aadha karna sirf constant hai.' } },
    { front: { en: 'How long does O(n²) take at n = 10⁵?', hi: 'n = 10⁵ pe O(n²) kitna time?' }, back: { en: 'About 10¹⁰ operations, which is roughly 100 seconds. Too slow.', hi: '~10¹⁰ operations ≈ 100 seconds. Bahut slow.' } },
    { front: { en: 'Kadane: what does `sum` mean?', hi: 'Kadane: `sum` ka matlab?' }, back: { en: 'The best sum of a subarray that ends exactly at the current position.', hi: 'Current position pe hi khatam hone wale subarray ka best sum.' } },
    { front: { en: 'What does O(n log n) usually indicate?', hi: 'O(n log n) aksar kya batata hai?' }, back: { en: 'Sorting, or n operations on a log-time data structure.', hi: 'Sorting, ya log-time data structure pe n operations.' } },
  ],
};

export default extras;
