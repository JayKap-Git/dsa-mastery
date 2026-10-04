import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: { en: 'Coins {1, 3, 4}. What is solve(10), the fewest coins for 10?', hi: 'Coins {1, 3, 4}. solve(10) — 10 ke liye kam se kam coins?' },
      options: ['3', '4', '2', '10'],
      answer: 0,
      explain: { en: '3 + 3 + 4. Greedy would take 4 + 4 + 1 + 1 = 4 coins.', hi: '3 + 3 + 4. Greedy 4 + 4 + 1 + 1 = 4 coins leta.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Time complexity of the bottom-up coin DP for sum n and k coins?', hi: 'Sum n aur k coins ke liye bottom-up coin DP ki complexity?' },
      options: ['O(n·k)', 'O(kⁿ)', 'O(n²)', 'O(n log n)'],
      answer: 0,
      explain: { en: 'There are n + 1 states, each trying k coins. Without memoization the recursion is exponential.', hi: 'n + 1 states, har ek k coins try karta hai. Memoization ke bina recursion exponential hai.' },
    },
    {
      kind: 'trace',
      q: { en: 'Coins {1, 3, 4}. How many ordered ways make 5?', hi: 'Coins {1, 3, 4}. 5 banane ke kitne ordered tareeke?' },
      options: ['6', '3', '4', '5'],
      answer: 0,
      explain: { en: '1+1+1+1+1, 1+1+3, 1+3+1, 3+1+1, 1+4 and 4+1. count[5] = count[4] + count[2] + count[1] = 4 + 1 + 1.', hi: '1+1+1+1+1, 1+1+3, 1+3+1, 3+1+1, 1+4, 4+1. count[5] = count[4] + count[2] + count[1] = 4 + 1 + 1.' },
    },
    {
      kind: 'concept',
      q: { en: 'To count unordered combinations of coins (1+3 is the same as 3+1), which loop goes outside?', hi: 'Coins ke unordered combinations ginne ke liye (1+3 = 3+1) kaunsa loop bahar?' },
      options: [
        { en: 'The loop over coins', hi: 'Coins wala loop' },
        { en: 'The loop over sums x', hi: 'Sums x wala loop' },
        { en: 'Either; the result is the same', hi: 'Koi bhi; result same' },
        { en: 'You need a 3-D table', hi: '3-D table chahiye' },
      ],
      answer: 0,
      explain: { en: 'With coins outside, each coin type is added in a fixed order, so every multiset is counted exactly once (CSES Coin Combinations II).', hi: 'Coins bahar: har coin type fixed order mein judta hai, toh har multiset theek ek baar gina jaata hai (CSES Coin Combinations II).' },
    },
    {
      kind: 'trace',
      q: { en: 'Length of the longest increasing subsequence of [6, 2, 5, 1, 7, 4, 8, 3]?', hi: '[6, 2, 5, 1, 7, 4, 8, 3] ke longest increasing subsequence ki length?' },
      options: ['4', '3', '5', '8'],
      answer: 0,
      explain: { en: 'For example 2, 5, 7, 8. length(k) = [1, 1, 2, 1, 3, 2, 4, 2], and the max is 4.', hi: 'Jaise 2, 5, 7, 8. length(k) = [1, 1, 2, 1, 3, 2, 4, 2], max 4.' },
    },
    {
      kind: 'concept',
      q: { en: 'In the 1-D knapsack (which sums are possible), why loop x from high to low?', hi: '1-D knapsack (kaunse sums possible) mein x ko upar se neeche kyun loop karte hain?' },
      options: [
        { en: 'So each weight is used at most once', hi: 'Taaki har weight max ek baar use ho' },
        { en: 'It is faster', hi: 'Yeh fast hai' },
        { en: 'To avoid negative indices', hi: 'Negative indices se bachne ke liye' },
        { en: 'It makes no difference', hi: 'Koi fark nahi padta' },
      ],
      answer: 0,
      explain: { en: 'Going upwards, a sum made with weight w this round could be extended by w again, which would mean using w twice.', hi: 'Upar ki taraf jaoge toh is round mein w se bana sum dobara w se badh sakta hai — matlab w do baar.' },
    },
    {
      kind: 'trace',
      q: { en: 'What is the edit distance between LOVE and MOVIE?', hi: 'LOVE aur MOVIE ka edit distance?' },
      options: ['2', '1', '3', '5'],
      answer: 0,
      explain: { en: 'Modify L→M (MOVE), then insert I (MOVIE). One operation can’t do it.', hi: 'L→M modify (MOVE), phir I insert (MOVIE). Ek operation kaafi nahi.' },
    },
    {
      kind: 'complexity',
      q: { en: 'Counting tilings of an n×m grid with the bitmask DP: why put the shorter side in m?', hi: 'Bitmask DP se n×m tilings ginte waqt chhoti side m mein kyun?' },
      options: [
        { en: 'The states grow like 2^m (and the transitions up to 4^m)', hi: 'States 2^m jaise badhte hain (transitions 4^m tak)' },
        { en: 'n must be even', hi: 'n even hona chahiye' },
        { en: 'Java arrays must be square', hi: 'Java arrays square hone chahiye' },
        { en: 'It doesn’t matter', hi: 'Koi fark nahi' },
      ],
      answer: 0,
      explain: { en: 'The work is exponential in m but linear in n. 6×20 should be computed as 20 rows of 6 columns.', hi: 'Kaam m mein exponential, n mein linear. 6×20 ko 6 columns ki 20 rows ki tarah nikaalo.' },
    },
    {
      kind: 'concept',
      q: { en: 'What does memoization change about the slow recursive solution?', hi: 'Memoization slow recursive solution mein kya badalta hai?' },
      options: [
        { en: 'Each subproblem is solved once; repeats become array lookups', hi: 'Har subproblem ek baar solve; repeats array lookups ban jaate hain' },
        { en: 'It changes the recurrence', hi: 'Recurrence badal deta hai' },
        { en: 'It removes the base cases', hi: 'Base cases hata deta hai' },
        { en: 'It makes the answer approximate', hi: 'Answer approximate ho jaata hai' },
      ],
      answer: 0,
      explain: { en: 'Same recursion, same answer; the running time drops from exponential to (states) × (work per state).', hi: 'Same recursion, same answer — time exponential se (states) × (har state ka kaam) ho jaata hai.' },
    },
  ],

  practice: [
    { id: 1633, name: 'Dice Combinations', level: 'easy', section: '7.1', note: { en: 'Counting with coins 1..6, modulo 10⁹+7.', hi: 'Coins 1..6 ke saath counting, modulo 10⁹+7.' } },
    { id: 1634, name: 'Minimizing Coins', level: 'easy', section: '7.1', note: { en: 'Exactly the iterative coin DP.', hi: 'Bilkul iterative coin DP.' } },
    { id: 1635, name: 'Coin Combinations I', level: 'easy', section: '7.1', note: { en: 'Ordered ways: the sum loop outside.', hi: 'Ordered tareeke: sum loop bahar.' } },
    { id: 1636, name: 'Coin Combinations II', level: 'medium', section: '7.1', note: { en: 'Unordered: the coin loop outside.', hi: 'Unordered: coin loop bahar.' } },
    { id: 1638, name: 'Grid Paths I', level: 'easy', section: '7.3', note: { en: 'Count paths with traps: ways from the left plus from above.', hi: 'Traps ke saath paths gino: left se + upar se.' } },
    { id: 1745, name: 'Money Sums', level: 'easy', section: '7.4', note: { en: 'Exactly "which sums are possible", right to left.', hi: 'Bilkul "kaunse sums possible", right to left.' } },
    { id: 1158, name: 'Book Shop', level: 'medium', section: '7.4', note: { en: '0/1 knapsack with values; use an int[] of size x + 1.', hi: 'Values wala 0/1 knapsack; x + 1 size ka int[].' } },
    { id: 1639, name: 'Edit Distance', level: 'medium', section: '7.5', note: { en: 'The Levenshtein table.', hi: 'Levenshtein table.' } },
    { id: 1145, name: 'Increasing Subsequence', level: 'medium', section: '7.2', note: { en: 'n = 2·10⁵, so you need the O(n log n) tails method.', hi: 'n = 2·10⁵ — O(n log n) tails method chahiye.' } },
    { id: 2181, name: 'Counting Tilings', level: 'hard', section: '7.6', note: { en: 'The bitmask DP with m ≤ 10 columns.', hi: 'Bitmask DP, m ≤ 10 columns.' } },
  ],

  cheatsheet: [
    { title: 'DP recipe', body: { en: 'State (what is the subproblem?) → recurrence → base cases → order of evaluation → answer. Time = states × work per state.', hi: 'State (subproblem kya?) → recurrence → base cases → evaluation order → answer. Time = states × har state ka kaam.' } },
    { title: 'Coins', body: { en: '`best[x] = min over c of best[x−c] + 1`; `count[x] = Σ count[x−c]` (mod). Keep `first[x]` to reconstruct.', hi: '`best[x] = min (c pe) best[x−c] + 1`; `count[x] = Σ count[x−c]` (mod). Solution ke liye `first[x]`.' } },
    { title: 'LIS', body: { en: 'O(n²): `len[k] = 1 + max len[i]` over i < k with a[i] < a[k]. O(n log n): the sorted tails + lower bound.', hi: 'O(n²): `len[k] = 1 + max len[i]` (i < k, a[i] < a[k]). O(n log n): sorted tails + lower bound.' } },
    { title: 'Grid', body: { en: '`sum[y][x] = max(sum[y][x−1], sum[y−1][x]) + v[y][x]` with a zero border. Walk back for the path.', hi: '`sum[y][x] = max(sum[y][x−1], sum[y−1][x]) + v[y][x]`, zero border ke saath. Path ke liye peeche chalo.' } },
    { title: 'Knapsack', body: { en: 'Possible sums: `for w: for x = W−w..0: if (p[x]) p[x+w] = true`. 0/1 values: `best[c] = max(best[c], best[c−w]+v)` with c going down.', hi: 'Possible sums: `for w: for x = W−w..0: if (p[x]) p[x+w] = true`. 0/1 values: `best[c] = max(best[c], best[c−w]+v)`, c neeche ki taraf.' } },
    { title: 'Edit distance', body: { en: '`d[a][b] = min(d[a][b−1]+1, d[a−1][b]+1, d[a−1][b−1]+cost)` with the first row/column = 0,1,2,… O(nm).', hi: '`d[a][b] = min(d[a][b−1]+1, d[a−1][b]+1, d[a−1][b−1]+cost)`, pehli row/column = 0,1,2,… O(nm).' } },
    { title: 'Profile DP', body: { en: 'Row by row with a bitmask of "already covered" columns. Put the short side in the mask.', hi: 'Row by row, "pehle se dhake" columns ka bitmask. Chhoti side mask mein.' } },
  ],

  flashcards: [
    { front: { en: 'Two things DP is used for?', hi: 'DP ke do istemaal?' }, back: { en: 'Finding an optimum (min/max) and counting solutions.', hi: 'Optimum (min/max) nikaalna, aur solutions ginna.' } },
    { front: { en: 'Memoization vs bottom-up?', hi: 'Memoization vs bottom-up?' }, back: { en: 'The same states and answers. Bottom-up fills a table in dependency order: shorter, with no recursion depth and smaller constants.', hi: 'Same states, same answers. Bottom-up table dependency order mein bharta hai — chhota code, recursion depth nahi, chhote constants.' } },
    { front: { en: 'LIS subproblem?', hi: 'LIS ka subproblem?' }, back: { en: 'length(k): the longest increasing subsequence ending at k.', hi: 'length(k) — k pe khatam hone wala sabse lamba increasing subsequence.' } },
    { front: { en: 'Edit distance: the three cases?', hi: 'Edit distance: teen cases?' }, back: { en: 'Insert (a, b−1) + 1, remove (a−1, b) + 1, match/modify (a−1, b−1) + [x≠y].', hi: 'Insert (a, b−1) + 1, remove (a−1, b) + 1, match/modify (a−1, b−1) + [x≠y].' } },
    { front: { en: 'Coin Combinations I vs II?', hi: 'Coin Combinations I vs II?' }, back: { en: 'I: sums outside, coins inside (ordered). II: coins outside (unordered).', hi: 'I: sums bahar, coins andar (ordered). II: coins bahar (unordered).' } },
    { front: { en: '4×7 domino tilings?', hi: '4×7 domino tilings?' }, back: { en: '781', hi: '781' } },
  ],
};

export default extras;
