import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: {
        en: 'arr = [1, 3, 4, 8, 6, 1, 4, 2] has prefix array p = [1, 4, 8, 16, 22, 23, 27, 29]. What is sumq(2, 5)?',
        hi: 'arr = [1, 3, 4, 8, 6, 1, 4, 2] ka prefix array p = [1, 4, 8, 16, 22, 23, 27, 29] hai. sumq(2, 5) kitna hoga?',
      },
      options: ['19', '15', '23', '18'],
      answer: 0,
      explain: {
        en: 'sumq(2, 5) = p[5] − p[1] = 23 − 4 = 19. Check: 4 + 8 + 6 + 1 = 19.',
        hi: 'sumq(2, 5) = p[5] − p[1] = 23 − 4 = 19. Check karo: 4 + 8 + 6 + 1 = 19.',
      },
    },
    {
      kind: 'concept',
      q: {
        en: 'A sparse-table query has range length 13. Which blocks does it combine?',
        hi: 'Sparse-table query ki range length 13 hai. Kaunse blocks combine honge?',
      },
      options: [
        { en: 'Two blocks of length 8: [a, a+7] and [b−7, b]', hi: 'Length 8 ke do blocks: [a, a+7] aur [b−7, b]' },
        { en: 'One block of length 16 starting at a', hi: 'a se shuru length 16 ka ek block' },
        { en: 'Four blocks of length 4 (plus one of length 1)', hi: 'Length 4 ke chaar blocks (aur ek length 1 ka)' },
        { en: 'One block of length 13', hi: 'Length 13 ka ek block' },
      ],
      answer: 0,
      explain: {
        en: 'k is the largest power of two ≤ 13, which is 8. Two length-8 blocks, one starting at a and one ending at b, cover the range. They overlap by 3 elements, which is harmless for min.',
        hi: 'k = 13 se chhota ya barabar sabse bada power of two = 8. Length 8 ke do blocks — ek a se shuru, ek b pe khatam — range cover kar lete hain. 3 elements overlap hote hain, jo min ke liye bilkul safe hai.',
      },
    },
    {
      kind: 'concept',
      q: {
        en: 'Why can’t the sparse table’s O(1) query trick answer sum queries?',
        hi: 'Sparse table wali O(1) query trick sum queries pe kyun nahi chalti?',
      },
      options: [
        { en: 'The two blocks may overlap, so those elements would be counted twice', hi: 'Do blocks overlap kar sakte hain, toh woh elements do baar jud jayenge' },
        { en: 'Sums need more memory than minimums', hi: 'Sum ko minimum se zyada memory chahiye' },
        { en: 'Addition is not associative', hi: 'Addition associative nahi hai' },
        { en: 'It can; you just need a larger k', hi: 'Chalti hai, bas bada k chahiye' },
      ],
      answer: 0,
      explain: {
        en: 'min is idempotent: min(x, x) = x, so double-counting doesn’t matter. x + x ≠ x, so sums would be wrong. Use prefix sums for static sums.',
        hi: 'min idempotent hai: min(x, x) = x, toh do baar ginne se farak nahi padta. Par x + x ≠ x, isliye sum galat aayega. Static sums ke liye prefix sums use karo.',
      },
    },
    {
      kind: 'trace',
      q: {
        en: 'In a Fenwick tree with n = 16, which positions does sum(13) read?',
        hi: 'n = 16 wale Fenwick tree mein sum(13) kaunsi positions padhega?',
      },
      options: ['13, 12, 8', '13, 14, 16', '13, 11, 7, 3', '13, 9, 1'],
      answer: 0,
      explain: {
        en: '13 = 1101₂. Clearing the lowest 1-bit each time gives 1101 → 1100 (12) → 1000 (8) → 0. So it adds tree[13] + tree[12] + tree[8] = sumq(13,13) + sumq(9,12) + sumq(1,8).',
        hi: '13 = 1101₂. Har baar lowest 1-bit hatao: 1101 → 1100 (12) → 1000 (8) → 0. Toh tree[13] + tree[12] + tree[8] = sumq(13,13) + sumq(9,12) + sumq(1,8).',
      },
    },
    {
      kind: 'trace',
      q: {
        en: 'Same tree (n = 16). Which positions does add(5, x) update?',
        hi: 'Wahi tree (n = 16). add(5, x) kaunsi positions update karega?',
      },
      options: ['5, 6, 8, 16', '5, 4, 0', '5, 7, 15', '5, 10, 20'],
      answer: 0,
      explain: {
        en: 'k += k & −k: 5 (0101) → 6 (0110) → 8 (1000) → 16 (10000) → 32 > n, stop. These are exactly the ranges that contain position 5.',
        hi: 'k += k & −k: 5 (0101) → 6 (0110) → 8 (1000) → 16 (10000) → 32 > n, ruk jao. Yahi woh ranges hain jinme position 5 aati hai.',
      },
    },
    {
      kind: 'concept',
      q: {
        en: 'In the bottom-up segment tree with n = 8, which array range does tree[5] cover?',
        hi: 'n = 8 wale bottom-up segment tree mein tree[5] kaunsi array range cover karta hai?',
      },
      options: ['[2, 3]', '[4, 5]', '[5, 5]', '[1, 2]'],
      answer: 0,
      explain: {
        en: 'Node 5’s children are 10 and 11, both leaves (≥ n = 8). Leaves 10 and 11 hold arr[10 − 8] and arr[11 − 8], i.e. arr[2..3].',
        hi: 'Node 5 ke children 10 aur 11 hain — dono leaves (≥ n = 8). Leaf 10 aur 11 mein arr[10 − 8] aur arr[11 − 8], yaani arr[2..3].',
      },
    },
    {
      kind: 'trace',
      q: {
        en: 'With n = 8, how many tree nodes does sum(1, 6) add together?',
        hi: 'n = 8 ke saath sum(1, 6) kitne tree nodes jodega?',
      },
      code: 'a = 1 + 8 = 9, b = 6 + 8 = 14\nwhile (a <= b) {\n    if (a % 2 == 1) s += tree[a++];\n    if (b % 2 == 0) s += tree[b--];\n    a /= 2; b /= 2;\n}',
      options: ['4', '2', '6', '3'],
      answer: 0,
      explain: {
        en: 'Level 1: a = 9 is odd, so take tree[9] (arr[1]); b = 14 is even, so take tree[14] (arr[6]). Now a = 5, b = 6. Level 2: take tree[5] (arr[2..3]) and tree[6] (arr[4..5]). Then a = 3 > b = 2. Four nodes in total.',
        hi: 'Level 1: a = 9 odd → tree[9] (arr[1]) lo; b = 14 even → tree[14] (arr[6]) lo. Ab a = 5, b = 6. Level 2: tree[5] (arr[2..3]) aur tree[6] (arr[4..5]). Phir a = 3 > b = 2. Total chaar nodes.',
      },
    },
    {
      kind: 'complexity',
      q: {
        en: 'n = 2·10⁵ values and q = 2·10⁵ operations, each either "set arr[k]" or "sum of [a, b]". Which approach fits in about one second?',
        hi: 'n = 2·10⁵ values aur q = 2·10⁵ operations — ya toh "arr[k] set karo" ya "[a, b] ka sum". Kaunsa approach ~1 second mein chalega?',
      },
      options: [
        { en: 'Fenwick tree: O((n + q) log n)', hi: 'Fenwick tree: O((n + q) log n)' },
        { en: 'Rebuild prefix sums after each update: O(nq)', hi: 'Har update ke baad prefix sums dobara: O(nq)' },
        { en: 'Sparse table: O(1) per query', hi: 'Sparse table: har query O(1)' },
        { en: 'A plain loop per query: O(nq)', hi: 'Har query pe simple loop: O(nq)' },
      ],
      answer: 0,
      explain: {
        en: 'O(nq) is 4·10¹⁰, far too slow. A sparse table can’t handle updates. A Fenwick tree does about 4·10⁵ × 18 ≈ 7·10⁶ steps. (For "set", add the difference: add(k, x − arr[k]).)',
        hi: 'O(nq) = 4·10¹⁰ — bahut slow. Sparse table updates nahi sambhal sakta. Fenwick tree lagbhag 4·10⁵ × 18 ≈ 7·10⁶ steps. ("set" ke liye difference jodo: add(k, x − arr[k]).)',
      },
    },
    {
      kind: 'java',
      q: {
        en: 'Values go up to 10⁹ and n = 2·10⁵. You store prefix sums in an int[]. What happens?',
        hi: 'Values 10⁹ tak hain aur n = 2·10⁵. Prefix sums ko int[] mein store kiya. Kya hoga?',
      },
      options: [
        { en: 'Silent overflow: sums reach 2·10¹⁴ ≫ Integer.MAX_VALUE, so use long[]', hi: 'Chupchaap overflow: sum 2·10¹⁴ tak ≫ Integer.MAX_VALUE — long[] use karo' },
        { en: 'It works fine', hi: 'Sab theek chalega' },
        { en: 'ArrayIndexOutOfBoundsException', hi: 'ArrayIndexOutOfBoundsException' },
        { en: 'Java automatically promotes the array to long', hi: 'Java khud array ko long bana dega' },
      ],
      answer: 0,
      explain: {
        en: 'Java int arithmetic wraps around modulo 2³² with no exception. Integer.MAX_VALUE is about 2.1·10⁹, so the 3rd value of 10⁹ already overflows.',
        hi: 'Java mein int arithmetic bina exception ke 2³² ke modulo wrap ho jaata hai. Integer.MAX_VALUE ≈ 2.1·10⁹ hai, toh 10⁹ wali teesri value pe hi overflow.',
      },
    },
    {
      kind: 'concept',
      q: {
        en: 'With a difference array d, how do you add x to every element of arr[a..b]?',
        hi: 'Difference array d ke saath arr[a..b] ke har element mein x kaise jodoge?',
      },
      options: [
        'd[a] += x; d[b + 1] −= x',
        'd[a] += x; d[b] −= x',
        { en: 'Add x to every d[a..b]', hi: 'd[a..b] har ek mein x jodo' },
        'd[a − 1] −= x; d[b] += x',
      ],
      answer: 0,
      explain: {
        en: 'arr is the prefix sum of d. Raising d[a] lifts every prefix from a onward; lowering d[b + 1] cancels the lift after b.',
        hi: 'arr, d ka prefix sum hai. d[a] badhane se a se aage ka har prefix badh jaata hai; d[b + 1] ghatane se b ke baad woh badhat cancel.',
      },
    },
  ],

  practice: [
    { id: 1646, name: 'Static Range Sum Queries', level: 'easy', section: '9.1', note: { en: 'Prefix sums. Store them in a long[].', hi: 'Prefix sums — long[] mein rakhna.' } },
    { id: 1647, name: 'Static Range Minimum Queries', level: 'easy', section: '9.1', note: { en: 'Sparse table, O(1) per query.', hi: 'Sparse table, har query O(1).' } },
    { id: 1652, name: 'Forest Queries', level: 'easy', section: '9.1', note: { en: '2D prefix sums on a grid of trees.', hi: 'Trees ke grid pe 2D prefix sums.' } },
    { id: 1650, name: 'Range Xor Queries', level: 'easy', section: '9.1', note: { en: 'xor undoes itself, so prefix xor works exactly like prefix sums.', hi: 'xor khud ko undo karta hai — prefix xor bilkul prefix sums ki tarah chalta hai.' } },
    { id: 1648, name: 'Dynamic Range Sum Queries', level: 'easy', section: '9.2', note: { en: 'Fenwick tree. "Set" = add(k, x − old value).', hi: 'Fenwick tree. "Set" = add(k, x − purani value).' } },
    { id: 1649, name: 'Dynamic Range Minimum Queries', level: 'easy', section: '9.3', note: { en: 'Min segment tree with set(k, x).', hi: 'set(k, x) ke saath min segment tree.' } },
    { id: 1651, name: 'Range Update Queries', level: 'medium', section: '9.4', note: { en: 'Difference array inside a Fenwick tree: range add + point query.', hi: 'Fenwick tree ke andar difference array: range add + point query.' } },
    { id: 1143, name: 'Hotel Queries', level: 'medium', section: '9.3', note: { en: 'Max segment tree; walk down to the first hotel with enough rooms (like argmin).', hi: 'Max segment tree; neeche utar ke pehla hotel dhundho jisme kaafi rooms hon (argmin jaisa).' } },
    { id: 1749, name: 'List Removals', level: 'medium', section: '9.3', note: { en: 'Count tree of 1s; walk down to find the k-th remaining element.', hi: '1s ka count tree; neeche utar ke k-th bacha hua element dhundho.' } },
    { id: 1144, name: 'Salary Queries', level: 'hard', section: '9.4', note: { en: 'Read all queries first, compress every salary, then a Fenwick tree over counts.', hi: 'Pehle saari queries padho, har salary compress karo, phir counts pe Fenwick tree.' } },
    { id: 2166, name: 'Prefix Sum Queries', level: 'hard', section: '9.3', note: { en: 'Each node stores (sum, best prefix). Design the combine function.', hi: 'Har node (sum, best prefix) rakhta hai — combine function khud design karo.' } },
    { id: 1190, name: 'Subarray Sum Queries', level: 'hard', section: '9.3', note: { en: 'Each node stores four values: sum, best prefix, best suffix, best subarray.', hi: 'Har node chaar values: sum, best prefix, best suffix, best subarray.' } },
  ],

  cheatsheet: [
    { title: 'Prefix sums', body: { en: '`p[k] = p[k−1] + a[k]`, `sumq(a,b) = p[b] − p[a−1]`. Build O(n), query O(1), no updates. Use `long[]`.', hi: '`p[k] = p[k−1] + a[k]`, `sumq(a,b) = p[b] − p[a−1]`. Build O(n), query O(1), updates nahi. `long[]` lo.' } },
    { title: '2D prefix sums', body: { en: '`s[i][j] = g + s[i−1][j] + s[i][j−1] − s[i−1][j−1]`; rectangle = `S(A) − S(B) − S(C) + S(D)`. Pad with a zero row and column.', hi: '`s[i][j] = g + s[i−1][j] + s[i][j−1] − s[i−1][j−1]`; rectangle = `S(A) − S(B) − S(C) + S(D)`. Zero row/column ka padding rakho.' } },
    { title: 'Sparse table', body: { en: '`mn[j][i] = min(mn[j−1][i], mn[j−1][i + 2^(j−1)])`. Query: `j = 31 − Integer.numberOfLeadingZeros(len)`, then two overlapping blocks. Only for min/max/gcd.', hi: '`mn[j][i] = min(mn[j−1][i], mn[j−1][i + 2^(j−1)])`. Query: `j = 31 − Integer.numberOfLeadingZeros(len)`, phir do overlapping blocks. Sirf min/max/gcd ke liye.' } },
    { title: 'Fenwick tree', body: { en: '1-indexed. `tree[k]` = sum of the `k & -k` values ending at k. sum: `k -= k & -k`; add: `k += k & -k`. Both O(log n).', hi: '1-indexed. `tree[k]` = k pe khatam hone wale `k & -k` values ka sum. sum: `k -= k & -k`; add: `k += k & -k`. Dono O(log n).' } },
    { title: 'Segment tree (bottom-up)', body: { en: 'Leaves at `tree[n..2n−1]`, children `2k, 2k+1`, parent `k/2`. Query: take odd `a`, even `b`, climb. Update: recompute the path to the root.', hi: 'Leaves `tree[n..2n−1]` pe, children `2k, 2k+1`, parent `k/2`. Query: odd `a`, even `b` lo, upar chado. Update: root tak ka path recompute.' } },
    { title: 'Other operations', body: { en: 'Any associative combine: min, max, gcd, xor, and, or. Identity: `0` for sum, `Long.MAX_VALUE` for min, `Long.MIN_VALUE` for max.', hi: 'Koi bhi associative combine: min, max, gcd, xor, and, or. Identity: sum ke liye `0`, min ke liye `Long.MAX_VALUE`, max ke liye `Long.MIN_VALUE`.' } },
    { title: 'Index compression', body: { en: 'Sort and dedupe, then `Arrays.binarySearch(sorted, x) + 1`. Keeps order. Offline only: collect all values first.', hi: 'Sort + dedupe, phir `Arrays.binarySearch(sorted, x) + 1`. Order same rehta hai. Sirf offline: pehle saari values collect karo.' } },
    { title: 'Difference array', body: { en: 'Range add: `d[a] += x; d[b+1] −= x`. A value is a prefix sum of d. With a Fenwick tree, range add + point query in O(log n).', hi: 'Range add: `d[a] += x; d[b+1] −= x`. Value = d ka prefix sum. Fenwick ke saath range add + point query O(log n).' } },
    { title: 'Which one?', body: { en: 'Static sum: prefix sums. Static min: sparse table. Updates + sum: Fenwick. Updates + anything else: segment tree.', hi: 'Static sum → prefix sums. Static min → sparse table. Updates + sum → Fenwick. Updates + kuch aur → segment tree.' } },
  ],

  flashcards: [
    { front: { en: 'What does tree[k] store in a Fenwick tree?', hi: 'Fenwick tree mein tree[k] kya store karta hai?' }, back: { en: 'sumq(k − p(k) + 1, k): the sum of the p(k) = k & −k values ending at k.', hi: 'sumq(k − p(k) + 1, k) — k pe khatam hone wali p(k) = k & −k values ka sum.' } },
    { front: { en: 'sumq(a, b) from a prefix array p?', hi: 'Prefix array p se sumq(a, b)?' }, back: { en: 'p[b] − p[a − 1], with p[−1] = 0.', hi: 'p[b] − p[a − 1], jahan p[−1] = 0.' } },
    { front: { en: 'Why is overlap OK in a sparse-table min query?', hi: 'Sparse-table min query mein overlap kyun chalta hai?' }, back: { en: 'min is idempotent: seeing an element twice doesn’t change the minimum. It would break a sum.', hi: 'min idempotent hai — ek element do baar dekhne se minimum nahi badalta. Sum mein galat ho jayega.' } },
    { front: { en: 'Segment-tree query: why take tree[a] alone when a is odd?', hi: 'Segment-tree query: a odd ho toh tree[a] akela kyun lete hain?' }, back: { en: 'Odd a is a right child, so its parent also covers elements left of the range. Take a, then a++.', hi: 'Odd a right child hai — uska parent range ke left ke elements bhi le lega. a lo, phir a++.' } },
    { front: { en: 'Heap indexing: children and parent of node k?', hi: 'Heap indexing: node k ke children aur parent?' }, back: { en: 'Children 2k and 2k + 1; parent k / 2. Root is 1; leaves are n … 2n − 1.', hi: 'Children 2k aur 2k + 1; parent k / 2. Root 1 hai; leaves n … 2n − 1.' } },
    { front: { en: 'Add x to arr[a..b] using a difference array?', hi: 'Difference array se arr[a..b] mein x kaise jodein?' }, back: { en: 'd[a] += x; d[b + 1] −= x.', hi: 'd[a] += x; d[b + 1] −= x.' } },
    { front: { en: 'k & −k for k = 12?', hi: 'k = 12 ke liye k & −k?' }, back: { en: '4. 12 = 1100₂, and its lowest set bit is 100₂.', hi: '4. 12 = 1100₂, aur lowest set bit 100₂ hai.' } },
    { front: { en: 'At most how many nodes per level does a segment-tree range query use?', hi: 'Segment-tree range query har level pe max kitne nodes use karti hai?' }, back: { en: 'Two, so O(log n) nodes in total.', hi: 'Do — isliye total O(log n) nodes.' } },
  ],
};

export default extras;
