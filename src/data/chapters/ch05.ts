import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: { en: 'Which subset of {0, 1, 2, 3, 4} does the bitmask 25 represent?', hi: 'Bitmask 25 {0, 1, 2, 3, 4} ka kaunsa subset hai?' },
      options: ['{0, 3, 4}', '{2, 5}', '{1, 3, 4}', '{0, 1, 4}'],
      answer: 0,
      explain: { en: '25 = 11001₂. Bits 0, 3 and 4 are set.', hi: '25 = 11001₂ — bits 0, 3 aur 4 set hain.' },
    },
    {
      kind: 'complexity',
      q: { en: 'How many calls does the recursive subset search make for n = 3?', hi: 'n = 3 ke liye recursive subset search kitni calls karta hai?' },
      options: ['15', '8', '7', '16'],
      answer: 0,
      explain: { en: 'A full binary tree of depth 3 has 1 + 2 + 4 + 8 = 2⁴ − 1 = 15 nodes, and 8 of them are leaves (subsets).', hi: 'Depth 3 ka full binary tree: 1 + 2 + 4 + 8 = 2⁴ − 1 = 15 nodes, jinme 8 leaves (subsets).' },
    },
    {
      kind: 'trace',
      q: { en: 'What is nextPermutation of [1, 3, 2]?', hi: '[1, 3, 2] ka nextPermutation kya hai?' },
      options: ['[2, 1, 3]', '[2, 3, 1]', '[3, 1, 2]', '[1, 2, 3]'],
      answer: 0,
      explain: { en: 'The suffix [3, 2] is decreasing. Swap the 1 with the rightmost larger value, 2, to get [2, 3, 1], then reverse the suffix: [2, 1, 3].', hi: 'Suffix [3, 2] decreasing hai. 1 ko sabse right wale bade value 2 se swap → [2, 3, 1], phir suffix ulta: [2, 1, 3].' },
    },
    {
      kind: 'concept',
      q: { en: 'In n queens, which diag1 index do squares (x=1, y=2) and (x=2, y=1) share?', hi: 'n queens mein (x=1, y=2) aur (x=2, y=1) kaunsa diag1 index share karte hain?' },
      options: ['3', '1', '−1', { en: 'They are not on the same diagonal', hi: 'Same diagonal pe nahi hain' }],
      answer: 0,
      explain: { en: 'diag1 is indexed by x + y = 3 for both: they lie on the same anti-diagonal.', hi: 'diag1 ka index x + y = 3, dono ke liye — same anti-diagonal pe hain.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Trying all permutations is comfortable in 1 second up to about…', hi: 'Saare permutations 1 second mein aaram se lagbhag kitne n tak?' },
      options: ['n = 10', 'n = 15', 'n = 20', 'n = 100'],
      answer: 0,
      explain: { en: '10! ≈ 3.6·10⁶ is fine. 12! ≈ 4.8·10⁸ is already too slow, especially with O(n) work per permutation.', hi: '10! ≈ 3.6·10⁶ theek hai; 12! ≈ 4.8·10⁸ already slow — khaas kar jab har permutation pe O(n) kaam ho.' },
    },
    {
      kind: 'concept',
      q: { en: 'Why must backtracking undo its change after the recursive call returns?', hi: 'Recursive call ke baad backtracking ko apna change undo kyun karna padta hai?' },
      options: [
        { en: 'So the next option at this level starts from the same state', hi: 'Taaki is level ka agla option same state se shuru ho' },
        { en: 'To free memory', hi: 'Memory free karne ke liye' },
        { en: 'Java requires it', hi: 'Java ise zaroori banata hai' },
        { en: 'To count solutions', hi: 'Solutions ginne ke liye' },
      ],
      answer: 0,
      explain: { en: 'The search shares one board or list between all branches. Each branch must leave it exactly as it found it.', hi: 'Saare branches ek hi board/list share karte hain; har branch ko use waisa hi chhodna hai jaisa mila tha.' },
    },
    {
      kind: 'concept',
      q: { en: 'Which pruning helps the most?', hi: 'Kaunsa pruning sabse zyada madad karta hai?' },
      options: [
        { en: 'Cuts that apply early, near the top of the search tree', hi: 'Jo jaldi lagein, search tree ke upar' },
        { en: 'Cuts that apply only at the leaves', hi: 'Jo sirf leaves pe lagein' },
        { en: 'Cuts that apply rarely but save a lot each time', hi: 'Jo kabhi-kabhi lagein par har baar bahut bachaayein' },
        { en: 'All cuts help equally', hi: 'Saare barabar madad karte hain' },
      ],
      answer: 0,
      explain: { en: 'Cutting a branch high up removes its whole subtree. In the grid example the split rules gave about 100×, symmetry only 2×.', hi: 'Upar kata branch apna poora subtree hata deta hai. Grid example mein split rules ne ~100× diya, symmetry ne sirf 2×.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Subset sum with n = 40 numbers. Roughly how many subset sums does meet in the middle generate?', hi: 'n = 40 numbers pe subset sum. Meet in the middle lagbhag kitne subset sums banata hai?' },
      options: ['2 · 2²⁰ ≈ 2·10⁶', '2⁴⁰ ≈ 10¹²', '40²', '40!'],
      answer: 0,
      explain: { en: 'Each half has 20 numbers, so 2²⁰ sums per half. Combining is linear in those lists.', hi: 'Har half mein 20 numbers → har half ke 2²⁰ sums; jodna un lists mein linear hai.' },
    },
  ],

  practice: [
    { id: 1623, name: 'Apple Division', level: 'easy', section: '5.1', note: { en: 'n ≤ 20: try all 2ⁿ splits with a bitmask.', hi: 'n ≤ 20: bitmask se saare 2ⁿ splits try karo.' } },
    { id: 1622, name: 'Creating Strings', level: 'easy', section: '5.2', note: { en: 'Sort the characters, then nextPermutation handles duplicates.', hi: 'Characters sort karo, phir nextPermutation duplicates sambhal leta hai.' } },
    { id: 2205, name: 'Gray Code', level: 'medium', section: '5.1', note: { en: 'Neighbouring masks differ in one bit: i ^ (i >> 1).', hi: 'Padosi masks mein ek bit ka fark: i ^ (i >> 1).' } },
    { id: 1624, name: 'Chessboard and Queens', level: 'medium', section: '5.3', note: { en: 'The n-queens backtracking, plus reserved squares.', hi: 'n-queens backtracking + reserved squares.' } },
    { id: 1625, name: 'Grid Path Description', level: 'hard', section: '5.4', note: { en: 'Exactly the pruning ideas from 5.4 (7×7, ending bottom-left).', hi: 'Bilkul 5.4 wale pruning ideas (7×7, bottom-left pe end).' } },
    { id: 1628, name: 'Meet in the Middle', level: 'hard', section: '5.5', note: { en: 'Count pairs of sums with sorted arrays and two pointers. Avoid HashMap.', hi: 'Sorted arrays + two pointers se sums ke pairs gino — HashMap se bacho.' } },
  ],

  cheatsheet: [
    { title: 'Subsets', body: { en: 'Recursion: skip k, take k, undo. Bits: `for (b = 0; b < 1 << n; b++)`, and element i is in when `(b & (1 << i)) != 0`. Both are O(2ⁿ · n).', hi: 'Recursion: k chhodo, k lo, undo. Bits: `for (b = 0; b < 1 << n; b++)`, element i andar jab `(b & (1 << i)) != 0`. Dono O(2ⁿ · n).' } },
    { title: 'Permutations', body: { en: 'Recursion with `chosen[]`, or `nextPermutation`: non-increasing suffix → swap → reverse. n ≤ 10 is fine.', hi: '`chosen[]` ke saath recursion, ya `nextPermutation`: non-increasing suffix → swap → reverse. n ≤ 10 theek.' } },
    { title: 'Backtracking', body: { en: 'Extend, recurse, undo. Make the "is this allowed?" check O(1) with helper arrays (queens: column, x+y, x−y+n−1).', hi: 'Badhao, recurse, undo. "Allowed hai?" check helper arrays se O(1) (queens: column, x+y, x−y+n−1).' } },
    { title: 'Pruning', body: { en: 'Stop as soon as a partial solution can’t finish. Early cuts beat late cuts. Use symmetry to halve work.', hi: 'Jaise hi partial solution poora na ho sake, ruko. Jaldi ke cuts der ke cuts se behtar. Symmetry se kaam aadha.' } },
    { title: 'Meet in the middle', body: { en: 'Split in two, enumerate each half (2^(n/2)), sort, combine with two pointers. Use it for n ≈ 40 subset problems.', hi: 'Do mein todo, har half enumerate (2^(n/2)), sort, two pointers se jodo. n ≈ 40 wale subset problems ke liye.' } },
  ],

  flashcards: [
    { front: { en: 'Is element i in mask b?', hi: 'Kya element i mask b mein hai?' }, back: { en: '`(b & (1 << i)) != 0`, or `1L << i` for long masks.', hi: '`(b & (1 << i)) != 0` — long masks ke liye `1L << i`.' } },
    { front: { en: 'The three steps of nextPermutation?', hi: 'nextPermutation ke teen steps?' }, back: { en: 'Find the longest non-increasing suffix; swap the element before it with the rightmost larger one; reverse the suffix.', hi: 'Sabse lamba non-increasing suffix; usse pehle wale ko sabse right wale bade se swap; suffix ulta.' } },
    { front: { en: 'n queens: the two diagonal indices of square (x, y)?', hi: 'n queens: square (x, y) ke do diagonal indices?' }, back: { en: 'x + y and x − y + n − 1.', hi: 'x + y aur x − y + n − 1.' } },
    { front: { en: 'q(8) = ?', hi: 'q(8) = ?' }, back: { en: '92', hi: '92' } },
    { front: { en: 'When is meet in the middle the right tool?', hi: 'Meet in the middle kab sahi tool hai?' }, back: { en: 'An O(2ⁿ) search with n ≈ 35–45, where two half-results can be combined quickly.', hi: 'O(2ⁿ) search, n ≈ 35–45, aur do half-results jaldi jod sakte hon.' } },
    { front: { en: 'Why copy the subset before storing it?', hi: 'Store karne se pehle subset copy kyun?' }, back: { en: 'The recursion keeps mutating the same list.', hi: 'Recursion wahi list badalta rehta hai.' } },
  ],
};

export default extras;
