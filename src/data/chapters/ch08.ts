import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'concept',
      q: { en: 'What does amortized analysis bound?', hi: 'Amortized analysis kya bound karta hai?' },
      options: [
        { en: 'The total work of all operations together', hi: 'Saare operations ka total kaam' },
        { en: 'The worst single operation', hi: 'Sabse mehenga single operation' },
        { en: 'The average over random inputs', hi: 'Random inputs pe average' },
        { en: 'The memory use', hi: 'Memory use' },
      ],
      answer: 0,
      explain: { en: 'One step may be expensive, but if the total over all n steps is O(n), the algorithm is O(n). No randomness is involved.', hi: 'Ek step mehenga ho sakta hai, par n steps ka total O(n) hai toh algorithm O(n). Isme koi randomness nahi.' },
    },
    {
      kind: 'trace',
      q: { en: '[1, 3, 2, 5, 1, 1, 2, 3], x = 8. Which subarray does the two-pointer method find?', hi: '[1, 3, 2, 5, 1, 1, 2, 3], x = 8. Two-pointer method kaunsa subarray dhundhta hai?' },
      options: ['2 + 5 + 1', '1 + 3 + 2 + 2', '5 + 1 + 1 + 1', '3 + 5'],
      answer: 0,
      explain: { en: 'L drops 1 and 3, then R takes 5 and 1: positions 2..4. (3 + 5 isn’t contiguous: 2 sits between them.)', hi: 'L 1 aur 3 chhodta hai, phir R 5 aur 1 leta hai: positions 2..4. (3 + 5 lagaatar nahi — beech mein 2 hai.)' },
    },
    {
      kind: 'concept',
      q: { en: 'Why does the subarray-sum method need positive numbers?', hi: 'Subarray-sum method ko positive numbers kyun chahiye?' },
      options: [
        { en: 'So that growing the window always increases the sum', hi: 'Taaki window badhane pe sum hamesha badhe' },
        { en: 'To avoid overflow', hi: 'Overflow se bachne ke liye' },
        { en: 'So the array can be sorted', hi: 'Taaki array sort ho sake' },
        { en: 'It doesn’t; any integers work', hi: 'Zaroorat nahi; koi bhi integers chalenge' },
      ],
      answer: 0,
      explain: { en: 'With a negative number, a window that is "too big" could become right after adding more, so stopping R early can miss answers.', hi: 'Negative number ho toh "bahut bada" window aur add karke sahi ban sakta hai — R ko jaldi rokne se answers miss ho sakte hain.' },
    },
    {
      kind: 'trace',
      q: { en: '2SUM on [1, 4, 5, 6, 7, 9, 9, 10] with x = 12. Which pair is found?', hi: '[1, 4, 5, 6, 7, 9, 9, 10] pe 2SUM, x = 12. Kaunsa pair milta hai?' },
      options: ['5 + 7', '1 + 10', '6 + 6', '4 + 9'],
      answer: 0,
      explain: { en: '1 + 10 = 11 (L moves), 4 + 10/9/9 are too big (R moves 3 times), 4 + 7 = 11 (L moves), 5 + 7 = 12.', hi: '1 + 10 = 11 (L hila), 4 + 10/9/9 bade (R 3 baar), 4 + 7 = 11 (L hila), 5 + 7 = 12.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Complexity of 3SUM with the two-pointer idea?', hi: 'Two-pointer idea se 3SUM ki complexity?' },
      options: ['O(n²)', 'O(n log n)', 'O(n³)', 'O(n)'],
      answer: 0,
      explain: { en: 'Sort once, then for each first value run a linear 2SUM on the rest: n × O(n).', hi: 'Ek baar sort, phir har pehli value ke liye baaki pe linear 2SUM: n × O(n).' },
    },
    {
      kind: 'trace',
      q: { en: 'Nearest smaller elements of [1, 3, 4, 2, 5, 3, 4, 2]: what is the answer for the last 2?', hi: '[1, 3, 4, 2, 5, 3, 4, 2] ke nearest smaller: aakhri 2 ka answer?' },
      options: ['1', '2', '3', 'none'],
      answer: 0,
      explain: { en: 'It pops 4, 3 and the earlier 2 (2 ≥ 2), leaving 1 on top. The nearest strictly smaller value is the 1 at position 0.', hi: 'Yeh 4, 3 aur pichhla 2 (2 ≥ 2) pop karta hai, top pe 1 bachta hai. Sabse paas ki strictly chhoti value position 0 wala 1.' },
    },
    {
      kind: 'complexity',
      q: { en: 'One element can pop many others off the stack. Why is the nearest-smaller algorithm still O(n)?', hi: 'Ek element stack se kai doosron ko pop kar sakta hai. Phir bhi nearest-smaller O(n) kyun?' },
      options: [
        { en: 'Each element is pushed once and popped at most once', hi: 'Har element ek baar push, max ek baar pop' },
        { en: 'The stack never holds more than log n elements', hi: 'Stack mein kabhi log n se zyada nahi' },
        { en: 'Pops are free in Java', hi: 'Java mein pop free hai' },
        { en: 'The inner loop runs at most once per element', hi: 'Inner loop har element pe max ek baar' },
      ],
      answer: 0,
      explain: { en: 'Total pops ≤ total pushes = n, so all the inner loops together run at most n times.', hi: 'Total pops ≤ total pushes = n, toh saare inner loops milake max n baar chalte hain.' },
    },
    {
      kind: 'trace',
      q: { en: 'Sliding window minimum of [2, 1, 4, 5, 3, 4, 1, 2] with k = 4?', hi: '[2, 1, 4, 5, 3, 4, 1, 2] ka sliding window minimum, k = 4?' },
      options: ['1, 1, 3, 1, 1', '1, 1, 1, 1, 1', '2, 1, 3, 1, 1', '1, 3, 3, 1, 1'],
      answer: 0,
      explain: { en: 'Windows: 2 1 4 5 → 1, 1 4 5 3 → 1, 4 5 3 4 → 3, 5 3 4 1 → 1, 3 4 1 2 → 1.', hi: 'Windows: 2 1 4 5 → 1, 1 4 5 3 → 1, 4 5 3 4 → 3, 5 3 4 1 → 1, 3 4 1 2 → 1.' },
    },
    {
      kind: 'concept',
      q: { en: 'In the sliding-window deque, why pop from the back every value ≥ the new one?', hi: 'Sliding-window deque mein naye se ≥ har value back se pop kyun?' },
      options: [
        { en: 'The new value is smaller and leaves the window later, so they can never be the minimum', hi: 'Naya value chhota hai aur window se baad mein jaayega — woh kabhi minimum nahi banenge' },
        { en: 'To keep the deque size ≤ k', hi: 'Deque size ≤ k rakhne ke liye' },
        { en: 'Because they left the window', hi: 'Kyunki woh window se nikal gaye' },
        { en: 'To sort the window', hi: 'Window sort karne ke liye' },
      ],
      answer: 0,
      explain: { en: 'Values that left the window are removed from the front instead. The back pops keep the deque increasing.', hi: 'Window se nikle values front se hat-te hain. Back ke pops deque ko increasing rakhte hain.' },
    },
  ],

  practice: [
    { id: 1660, name: 'Subarray Sums I', level: 'easy', section: '8.1', note: { en: 'Positive numbers: count the windows with sum x.', hi: 'Positive numbers: sum x wali windows gino.' } },
    { id: 1640, name: 'Sum of Two Values', level: 'easy', section: '8.1', note: { en: 'Sort {value, index} pairs, then 2SUM.', hi: '{value, index} pairs sort karo, phir 2SUM.' } },
    { id: 1090, name: 'Ferris Wheel', level: 'easy', section: '8.1', note: { en: 'Sort; pair the heaviest with the lightest if they fit.', hi: 'Sort; sabse bhaari ko sabse halke ke saath, agar fit ho.' } },
    { id: 1084, name: 'Apartments', level: 'easy', section: '8.1', note: { en: 'Sort both lists and walk them with two pointers.', hi: 'Dono lists sort, phir two pointers se chalo.' } },
    { id: 1645, name: 'Nearest Smaller Values', level: 'easy', section: '8.2', note: { en: 'Exactly the stack algorithm; print 1-based positions.', hi: 'Bilkul stack algorithm; 1-based positions print karo.' } },
    { id: 3221, name: 'Sliding Window Minimum', level: 'easy', section: '8.3', note: { en: 'The deque; the input is generated, so use fast arithmetic.', hi: 'Deque; input generate hota hai, toh fast arithmetic.' } },
    { id: 1141, name: 'Playlist', level: 'medium', section: '8.1', note: { en: 'Longest window with distinct values: R grows, L jumps past the repeat.', hi: 'Distinct values ki sabse lambi window: R badhta hai, L repeat ke aage kood-ta hai.' } },
    { id: 1641, name: 'Sum of Three Values', level: 'medium', section: '8.1', note: { en: '3SUM in O(n²) on sorted pairs.', hi: 'Sorted pairs pe O(n²) 3SUM.' } },
    { id: 1142, name: 'Advertisement', level: 'medium', section: '8.2', note: { en: 'Nearest smaller on both sides gives each bar’s width.', hi: 'Dono taraf nearest smaller se har bar ki width.' } },
    { id: 1644, name: 'Maximum Subarray Sum II', level: 'hard', section: '8.3', note: { en: 'Prefix sums plus a sliding-window minimum over the allowed starts.', hi: 'Prefix sums + allowed starts pe sliding-window minimum.' } },
  ],

  cheatsheet: [
    { title: 'Amortized', body: { en: 'Count how often something can happen in total (each pointer moves ≤ n; each element pushed/popped once), not the worst per step.', hi: 'Gino ki koi cheez total kitni baar ho sakti hai (har pointer ≤ n; har element ek baar push/pop) — har step ka worst nahi.' } },
    { title: 'Subarray sum', body: { en: 'Positive values only. R grows while `sum + a[R] ≤ x`; check; L drops `a[L]`. O(n).', hi: 'Sirf positive values. R badhta hai jab tak `sum + a[R] ≤ x`; check; L `a[L]` chhodta hai. O(n).' } },
    { title: '2SUM / 3SUM', body: { en: 'Sort; L from the left, R from the right; sum too big → R−−, too small → L++. 3SUM: fix one, 2SUM the rest, O(n²).', hi: 'Sort; L left se, R right se; sum bada → R−−, chhota → L++. 3SUM: ek fix, baaki pe 2SUM, O(n²).' } },
    { title: 'Monotonic stack', body: { en: 'Pop while `a[top] ≥ a[i]`; the top is the nearest smaller; push i. Flip the test for "greater"; walk right-to-left for the right side.', hi: 'Jab tak `a[top] ≥ a[i]` pop; top = nearest smaller; i push. "Greater" ke liye test ulta; right side ke liye right se chalo.' } },
    { title: 'Sliding window min', body: { en: 'Deque of positions with increasing values: pop back while `≥ a[i]`, pop front if `≤ i − k`, push i, answer `a[front]`.', hi: 'Increasing values wali positions ka deque: back se pop jab tak `≥ a[i]`, front pop agar `≤ i − k`, i push, answer `a[front]`.' } },
    { title: 'Java', body: { en: 'Avoid `java.util.Stack`. Use `ArrayDeque<Integer>`, or `int[]` with `top`/`head`/`tail` to skip boxing.', hi: '`java.util.Stack` se bacho. `ArrayDeque<Integer>`, ya boxing se bachne ke liye `int[]` + `top`/`head`/`tail`.' } },
  ],

  flashcards: [
    { front: { en: 'Why is two pointers O(n)?', hi: 'Two pointers O(n) kyun?' }, back: { en: 'Each pointer moves in one direction only, at most n steps in total.', hi: 'Har pointer sirf ek direction mein, total max n steps.' } },
    { front: { en: '2SUM: a[L] + a[R] > x. Which pointer moves?', hi: '2SUM: a[L] + a[R] > x. Kaunsa pointer hilega?' }, back: { en: 'R moves left: a[R] is too big even with the smallest remaining partner.', hi: 'R left: a[R] bache hue sabse chhote partner ke saath bhi bada hai.' } },
    { front: { en: 'Subarray sum with negative numbers?', hi: 'Negative numbers ke saath subarray sum?' }, back: { en: 'Two pointers fail. Use prefix sums + a HashMap of earlier prefix counts.', hi: 'Two pointers fail. Prefix sums + pichhle prefixes ka HashMap.' } },
    { front: { en: 'Nearest smaller: what does the stack look like?', hi: 'Nearest smaller: stack kaisa dikhta hai?' }, back: { en: 'Positions whose values strictly increase from bottom to top.', hi: 'Positions jinki values neeche se upar strictly badhti hain.' } },
    { front: { en: 'Sliding window min: where is the answer?', hi: 'Sliding window min: answer kahan hai?' }, back: { en: 'At the front of the deque.', hi: 'Deque ke front pe.' } },
    { front: { en: 'Total stack operations for n elements?', hi: 'n elements pe total stack operations?' }, back: { en: 'At most 2n: n pushes and at most n pops.', hi: 'Max 2n: n push aur max n pop.' } },
  ],
};

export default extras;
