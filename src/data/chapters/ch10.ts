import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: { en: 'What is 22 ^ 26?', hi: '22 ^ 26 kya hai?' },
      options: ['12', '18', '30', '4'],
      answer: 0,
      explain: { en: '10110 ^ 11010 = 01100 = 12. (18 is &, 30 is |.)', hi: '10110 ^ 11010 = 01100 = 12. (18 & hai, 30 | hai.)' },
    },
    {
      kind: 'trace',
      q: { en: 'In Java, what is ~29?', hi: 'Java mein ~29 kya hai?' },
      options: ['−30', '−29', '2', '4294967266'],
      answer: 0,
      explain: { en: '~x = −x − 1 for every int x, because −x = ~x + 1 in two’s complement.', hi: 'Har int x ke liye ~x = −x − 1, kyunki two’s complement mein −x = ~x + 1.' },
    },
    {
      kind: 'concept',
      q: { en: 'What does x & (x − 1) do?', hi: 'x & (x − 1) kya karta hai?' },
      options: [
        { en: 'Clears the last one bit of x', hi: 'x ka aakhri one bit hata deta hai' },
        { en: 'Keeps only the last one bit', hi: 'Sirf aakhri one bit rakhta hai' },
        { en: 'Rounds x down to a power of two', hi: 'x ko 2 ki power tak neeche round karta hai' },
        { en: 'Computes x mod 2', hi: 'x mod 2 nikaalta hai' },
      ],
      answer: 0,
      explain: { en: 'x − 1 flips the last one bit and every zero after it, so & removes exactly that bit. It’s 0 iff x is 0 or a power of two. (x & −x keeps only the last one bit.)', hi: 'x − 1 aakhri one bit aur uske baad ke saare zeros ulat deta hai, toh & theek woh bit hata deta hai. 0 tabhi jab x 0 ya 2 ki power. (x & −x sirf aakhri one bit rakhta hai.)' },
    },
    {
      kind: 'trace',
      q: { en: 'In Java, what are −7 >> 1 and −7 / 2?', hi: 'Java mein −7 >> 1 aur −7 / 2 kya hain?' },
      options: ['−4 and −3', '−3 and −3', '−4 and −4', '2147483644 and −3'],
      answer: 0,
      explain: { en: '>> is a floor division by 2ᵏ, while / rounds toward zero. (−7 >>> 1 would be 2147483644.)', hi: '>> 2ᵏ se floor division hai, jabki / zero ki taraf round karta hai. (−7 >>> 1 hota 2147483644.)' },
    },
    {
      kind: 'trace',
      q: { en: 'Which number represents the set {1, 3, 4, 8}?', hi: 'Set {1, 3, 4, 8} kaunsa number hai?' },
      options: ['282', '16', '1348', '154'],
      answer: 0,
      explain: { en: '2¹ + 2³ + 2⁴ + 2⁸ = 2 + 8 + 16 + 256 = 282.', hi: '2¹ + 2³ + 2⁴ + 2⁸ = 2 + 8 + 16 + 256 = 282.' },
    },
    {
      kind: 'concept',
      q: { en: 'With n elements, how do you get the complement of set a?', hi: 'n elements ke saath set a ka complement kaise?' },
      options: ['~a & ((1 << n) − 1)', '~a', '−a', 'a ^ 1'],
      answer: 0,
      explain: { en: '~a flips all 32 bits, including elements ≥ n that aren’t in the universe, so mask them off.', hi: '~a saare 32 bits ulat deta hai, unke bhi jo universe mein nahi (≥ n) — toh unhe mask karke hatao.' },
    },
    {
      kind: 'complexity',
      q: { en: 'How many subsets does the loop b = (b − x) & x visit when x has 5 elements?', hi: 'x mein 5 elements hon toh loop b = (b − x) & x kitne subsets visit karta hai?' },
      options: ['32', '5', '31', '1024'],
      answer: 0,
      explain: { en: 'Every subset of x exactly once, including the empty set: 2⁵ = 32.', hi: 'x ka har subset theek ek baar, khaali set samet: 2⁵ = 32.' },
    },
    {
      kind: 'trace',
      q: { en: 'Minimum Hamming distance among 00111, 01101 and 11110?', hi: '00111, 01101 aur 11110 mein minimum Hamming distance?' },
      options: ['2', '3', '1', '0'],
      answer: 0,
      explain: { en: 'bitCount(00111 ^ 01101) = bitCount(01010) = 2; the other two pairs give 3.', hi: 'bitCount(00111 ^ 01101) = bitCount(01010) = 2; baaki do pairs 3.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Elevator rides with n people: complexity of the subset DP?', hi: 'n logon ke saath elevator rides: subset DP ki complexity?' },
      options: ['O(2ⁿ · n)', 'O(n! · n)', 'O(n²)', 'O(3ⁿ)'],
      answer: 0,
      explain: { en: '2ⁿ sets, and for each one, n choices for the last person. Trying every order would be O(n! · n).', hi: '2ⁿ sets, har ek ke liye aakhri insaan ke n choices. Har order try karna O(n! · n) hota.' },
    },
    {
      kind: 'trace',
      q: { en: 'Book values (n = 3): value[∅]=3, {0}=1, {2}=5, {0,2}=1. What is sum({0, 2})?', hi: 'Book values (n = 3): value[∅]=3, {0}=1, {2}=5, {0,2}=1. sum({0, 2}) kya hai?' },
      options: ['10', '6', '7', '9'],
      answer: 0,
      explain: { en: 'All four subsets of {0, 2}: 3 + 1 + 5 + 1 = 10.', hi: '{0, 2} ke chaaron subsets: 3 + 1 + 5 + 1 = 10.' },
    },
  ],

  practice: [
    { id: 2205, name: 'Gray Code', level: 'easy', section: '10.2', note: { en: 'The i-th code is i ^ (i >> 1).', hi: 'i-th code = i ^ (i >> 1).' } },
    { id: 1623, name: 'Apple Division', level: 'easy', section: '10.3', note: { en: 'Loop over all 2ⁿ bitmasks as the first group.', hi: 'Saare 2ⁿ bitmasks ko pehla group maan ke loop.' } },
    { id: 1146, name: 'Counting Bits', level: 'medium', section: '10.2', note: { en: 'Count, bit by bit, how many numbers 1..n have that bit set.', hi: 'Har bit ke liye gino 1..n mein kitne numbers mein woh bit set hai.' } },
    { id: 2136, name: 'Hamming Distance', level: 'medium', section: '10.4', note: { en: 'Exactly the xor + Integer.bitCount trick.', hi: 'Bilkul xor + Integer.bitCount wali trick.' } },
    { id: 2185, name: 'Prime Multiples', level: 'medium', section: '10.3', note: { en: 'Inclusion–exclusion over subsets of primes; watch the overflow.', hi: 'Primes ke subsets pe inclusion–exclusion; overflow se bacho.' } },
    { id: 1653, name: 'Elevator Rides', level: 'hard', section: '10.5', note: { en: 'The (rides, last) subset DP from this chapter.', hi: 'Isi chapter ka (rides, last) subset DP.' } },
    { id: 1654, name: 'SOS Bit Problem', level: 'hard', section: '10.5', note: { en: 'Subset sums and superset sums over 2²⁰ masks.', hi: '2²⁰ masks pe subset sums aur superset sums.' } },
    { id: 3141, name: 'And Subset Count', level: 'hard', section: '10.5', note: { en: 'Superset sums, then inclusion–exclusion.', hi: 'Superset sums, phir inclusion–exclusion.' } },
  ],

  cheatsheet: [
    { title: 'Two’s complement', body: { en: '`-x == ~x + 1`, `~x == -x - 1`. int range −2³¹ … 2³¹−1; `MAX_VALUE + 1 == MIN_VALUE`. Unsigned view: `Integer.toUnsignedString(x)`.', hi: '`-x == ~x + 1`, `~x == -x - 1`. int range −2³¹ … 2³¹−1; `MAX_VALUE + 1 == MIN_VALUE`. Unsigned view: `Integer.toUnsignedString(x)`.' } },
    { title: 'Single bits', body: { en: 'Test `(x >> k & 1) == 1`; set `x | 1 << k`; clear `x & ~(1 << k)`; flip `x ^ 1 << k`. Use `1L << k` for long.', hi: 'Test `(x >> k & 1) == 1`; set `x | 1 << k`; clear `x & ~(1 << k)`; flip `x ^ 1 << k`. long ke liye `1L << k`.' } },
    { title: 'Last one bit', body: { en: '`x & (x - 1)` clears it (power of two ⇔ 0 for x > 0). `x & -x` keeps only it. `x | (x - 1)` fills ones after it.', hi: '`x & (x - 1)` use hatata hai (x > 0 ke liye 2 ki power ⇔ 0). `x & -x` sirf wahi rakhta hai. `x | (x - 1)` uske baad ones bhar deta hai.' } },
    { title: 'Java built-ins', body: { en: '`Integer.bitCount`, `numberOfLeadingZeros`, `numberOfTrailingZeros`, `highestOneBit`, `lowestOneBit`; the same in `Long`. `>>` is a floor division, `>>>` is unsigned.', hi: '`Integer.bitCount`, `numberOfLeadingZeros`, `numberOfTrailingZeros`, `highestOneBit`, `lowestOneBit`; `Long` mein bhi. `>>` floor division, `>>>` unsigned.' } },
    { title: 'Sets', body: { en: '∩ `a & b`, ∪ `a | b`, \\ `a & ~b`, size `bitCount(a)`, ⊆ `(b & ~a) == 0`. Submasks: `b = (b - x) & x` (up) or `s = (s - 1) & x` (down).', hi: '∩ `a & b`, ∪ `a | b`, \\ `a & ~b`, size `bitCount(a)`, ⊆ `(b & ~a) == 0`. Submasks: `b = (b - x) & x` (upar) ya `s = (s - 1) & x` (neeche).' } },
    { title: 'Subset DP', body: { en: 'State = bitmask, so `dp[1 << n]`. Loop s upwards (subsets come first). Permutations → subsets: n! becomes 2ⁿ·n. SOS: `for k: for s: if (s >> k & 1) sum[s] += sum[s ^ 1 << k]`.', hi: 'State = bitmask, toh `dp[1 << n]`. s ko upar ki taraf loop (subsets pehle aate hain). Permutations → subsets: n! ban jaata 2ⁿ·n. SOS: `for k: for s: if (s >> k & 1) sum[s] += sum[s ^ 1 << k]`.' } },
  ],

  flashcards: [
    { front: { en: '−x in two’s complement?', hi: 'Two’s complement mein −x?' }, back: { en: '~x + 1: invert all bits, add one.', hi: '~x + 1: saare bits ulte, ek jodo.' } },
    { front: { en: 'Is x (> 0) a power of two?', hi: 'Kya x (> 0) 2 ki power hai?' }, back: { en: '(x & (x − 1)) == 0, or Integer.bitCount(x) == 1.', hi: '(x & (x − 1)) == 0, ya Integer.bitCount(x) == 1.' } },
    { front: { en: '>> vs >>> in Java?', hi: 'Java mein >> vs >>>?' }, back: { en: '>> keeps the sign (floor division by 2ᵏ); >>> shifts in zeros.', hi: '>> sign rakhta hai (2ᵏ se floor division); >>> zeros laata hai.' } },
    { front: { en: 'g++ __builtin_popcount in Java?', hi: 'g++ __builtin_popcount Java mein?' }, back: { en: 'Integer.bitCount(x) (Long.bitCount for long).', hi: 'Integer.bitCount(x) (long ke liye Long.bitCount).' } },
    { front: { en: 'Hamming distance of two ints?', hi: 'Do ints ka Hamming distance?' }, back: { en: 'Integer.bitCount(a ^ b).', hi: 'Integer.bitCount(a ^ b).' } },
    { front: { en: 'Elevator rides: the DP value for a set S?', hi: 'Elevator rides: set S ki DP value?' }, back: { en: '(rides, weight of the last ride), minimised in that order.', hi: '(rides, aakhri ride ka weight), isi order mein minimise.' } },
    { front: { en: 'Total cost of iterating the submasks of every mask?', hi: 'Har mask ke submasks pe loop ki total cost?' }, back: { en: '3ⁿ (each element is outside, in the mask only, or in both).', hi: '3ⁿ (har element: bahar, sirf mask mein, ya dono mein).' } },
  ],
};

export default extras;
