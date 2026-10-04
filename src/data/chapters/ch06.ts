import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'trace',
      q: { en: 'Coins {1, 3, 4} and n = 6. How many coins does greedy use, and what is optimal?', hi: 'Coins {1, 3, 4}, n = 6. Greedy kitne coins leta hai, aur optimal kya hai?' },
      options: ['3 (4+1+1) vs 2 (3+3)', '2 vs 2', '3 vs 3', '6 vs 2'],
      answer: 0,
      explain: { en: 'Greedy grabs the 4 and is then stuck using 1s. Two 3s are better, so this greedy is not correct in general.', hi: 'Greedy 4 pakadta hai, phir 1s pe atak jaata hai. Do 3 behtar — yeh greedy general mein sahi nahi.' },
    },
    {
      kind: 'concept',
      q: { en: 'Which greedy rule always picks the maximum number of non-overlapping events?', hi: 'Kaunsa greedy rule hamesha maximum non-overlapping events chunta hai?' },
      options: [
        { en: 'Earliest end time first', hi: 'Sabse pehle khatam hone wala' },
        { en: 'Shortest event first', hi: 'Sabse chhota event pehle' },
        { en: 'Earliest start time first', hi: 'Sabse pehle shuru hone wala' },
        { en: 'Longest event first', hi: 'Sabse lamba event pehle' },
      ],
      answer: 0,
      explain: { en: 'Ending first leaves the most room. The other rules each have small counterexamples.', hi: 'Pehle khatam karne se sabse zyada jagah bachti hai. Baaki rules ke chhote counterexamples hain.' },
    },
    {
      kind: 'trace',
      q: { en: 'Tasks (duration, deadline): A(4, 2), B(3, 5), C(2, 7), D(4, 5). What is the best total score?', hi: 'Tasks (duration, deadline): A(4, 2), B(3, 5), C(2, 7), D(4, 5). Best total score?' },
      options: ['−10', '0', '−14', '−6'],
      answer: 0,
      explain: { en: 'Shortest first: C ends at 2 (+5), B at 5 (0), A at 9 (−7), D at 13 (−8). Total −10.', hi: 'Shortest first: C 2 pe (+5), B 5 pe (0), A 9 pe (−7), D 13 pe (−8). Total −10.' },
    },
    {
      kind: 'concept',
      q: { en: 'Task X (length a) is right before a shorter task Y (length b). Swapping them changes the total by…', hi: 'Task X (length a), chhote task Y (length b) se theek pehle hai. Swap karne se total kitna badalta hai?' },
      options: ['+(a − b)', '−(a − b)', '0', '+(a + b)'],
      answer: 0,
      explain: { en: 'Y finishes a earlier (+a) and X finishes b later (−b). This is the exchange argument.', hi: 'Y a pehle khatam (+a), X b baad (−b). Yahi exchange argument hai.' },
    },
    {
      kind: 'trace',
      q: { en: 'For [1, 2, 9, 2, 6], which x minimises Σ|aᵢ − x|, and what is the sum?', hi: '[1, 2, 9, 2, 6] ke liye kaunsa x Σ|aᵢ − x| minimise karta hai, aur sum kya?' },
      options: ['x = 2, sum 12', 'x = 4, sum 13', 'x = 9, sum 30', 'x = 2, sum 10'],
      answer: 0,
      explain: { en: 'The median of the sorted list [1, 2, 2, 6, 9] is 2: 1 + 0 + 7 + 0 + 4 = 12.', hi: 'Sorted [1, 2, 2, 6, 9] ka median 2: 1 + 0 + 7 + 0 + 4 = 12.' },
    },
    {
      kind: 'concept',
      q: { en: 'Which x minimises Σ(aᵢ − x)²?', hi: 'Kaunsa x Σ(aᵢ − x)² minimise karta hai?' },
      options: [{ en: 'The mean', hi: 'Mean' }, { en: 'The median', hi: 'Median' }, { en: 'The minimum', hi: 'Minimum' }, { en: 'The mode', hi: 'Mode' }],
      answer: 0,
      explain: { en: 'The sum is a parabola nx² − 2sx + const with its vertex at x = s/n.', hi: 'Sum ek parabola nx² − 2sx + const hai, jiska vertex x = s/n pe.' },
    },
    {
      kind: 'concept',
      q: { en: 'Why must no codeword be a prefix of another?', hi: 'Koi codeword doosre ka prefix kyun nahi hona chahiye?' },
      options: [
        { en: 'Otherwise a bit string could decode in more than one way', hi: 'Warna ek bit string ek se zyada tarah decode ho sakti hai' },
        { en: 'To make all codewords the same length', hi: 'Saare codewords same length ke ho jaayein' },
        { en: 'Huffman trees can’t store prefixes', hi: 'Huffman trees prefixes store nahi kar sakte' },
        { en: 'It makes the code shorter', hi: 'Code chhota ho jaata hai' },
      ],
      answer: 0,
      explain: { en: 'With 10 and 1011 both codewords, "1011" is ambiguous. Leaves of a binary tree always give a prefix-free code.', hi: '10 aur 1011 dono codewords hon toh "1011" ambiguous hai. Binary tree ke leaves hamesha prefix-free code dete hain.' },
    },
    {
      kind: 'trace',
      q: { en: 'How many bits does the Huffman code use for AABACDACA?', hi: 'AABACDACA ke liye Huffman code kitne bits leta hai?' },
      options: ['15', '18', '12', '9'],
      answer: 0,
      explain: { en: 'A=0 (×5), C=10 (×2), B=110, D=111 gives 5 + 4 + 3 + 3 = 15, compared with 18 for 2-bit codes.', hi: 'A=0 (×5), C=10 (×2), B=110, D=111 → 5 + 4 + 3 + 3 = 15, 2-bit codes ke 18 ke muqable.' },
    },
  ],

  practice: [
    { id: 1629, name: 'Movie Festival', level: 'easy', section: '6.2', note: { en: 'Exactly earliest-end scheduling.', hi: 'Bilkul earliest-end scheduling.' } },
    { id: 1630, name: 'Tasks and Deadlines', level: 'easy', section: '6.3', note: { en: 'Shortest first; use a long for the sum.', hi: 'Shortest first; sum ke liye long.' } },
    { id: 1074, name: 'Stick Lengths', level: 'easy', section: '6.4', note: { en: 'Move every stick to the median.', hi: 'Har stick median pe.' } },
    { id: 2183, name: 'Missing Coin Sum', level: 'medium', section: '6.1', note: { en: 'Sort; if the next coin > (sum so far) + 1, that value is missing.', hi: 'Sort; agla coin > (ab tak ka sum) + 1 ho toh woh value missing.' } },
    { id: 1631, name: 'Reading Books', level: 'medium', section: '6.3', note: { en: 'Prove a formula: max(sum, 2 · largest).', hi: 'Formula prove karo: max(sum, 2 · sabse bada).' } },
    { id: 1632, name: 'Movie Festival II', level: 'hard', section: '6.2', note: { en: 'Earliest end plus a multiset of members’ free times.', hi: 'Earliest end + members ke free times ka multiset.' } },
    { id: 1161, name: 'Stick Divisions', level: 'hard', section: '6.5', note: { en: 'Huffman in reverse: a min-heap, always merging the two smallest.', hi: 'Ulta Huffman: min-heap, hamesha do sabse chhote jodo.' } },
  ],

  cheatsheet: [
    { title: 'Greedy recipe', body: { en: 'Guess a rule, try to break it with a tiny counterexample, then prove it or brute-force check it. Usually sort + one pass.', hi: 'Rule socho, chhote counterexample se todne ki koshish karo, phir prove karo ya brute-force se check. Aksar sort + ek pass.' } },
    { title: 'Coins', body: { en: 'Largest-first is optimal for canonical systems like euro coins, but not in general (`{1,3,4}`, 6). Use DP for the general case.', hi: 'Largest-first euro jaise canonical systems pe optimal, general mein nahi (`{1,3,4}`, 6). General ke liye DP.' } },
    { title: 'Scheduling', body: { en: 'Sort by end time; take each event whose start ≥ the last taken end. O(n log n).', hi: 'End time se sort; har woh event lo jiska start ≥ pichhle liye gaye ka end. O(n log n).' } },
    { title: 'Exchange argument', body: { en: 'Show that swapping two neighbours that are "out of order" never hurts, so the sorted order is optimal (tasks: shortest first).', hi: 'Dikhao ki "galat order" wale do padosiyon ka swap kabhi nuksaan nahi karta — toh sorted order optimal (tasks: shortest first).' } },
    { title: 'Median and mean', body: { en: 'min Σ|a − x| → median; min Σ(a − x)² → mean.', hi: 'min Σ|a − x| → median; min Σ(a − x)² → mean.' } },
    { title: 'Huffman', body: { en: 'Min-heap of weights; merge the two smallest until one tree remains; left = 0, right = 1. Optimal prefix-free code.', hi: 'Weights ka min-heap; do sabse chhote jodo jab tak ek tree na bache; left = 0, right = 1. Optimal prefix-free code.' } },
  ],

  flashcards: [
    { front: { en: 'Counterexample to greedy coins?', hi: 'Greedy coins ka counterexample?' }, back: { en: 'Coins {1, 3, 4}, n = 6: greedy 4+1+1, optimal 3+3.', hi: 'Coins {1, 3, 4}, n = 6: greedy 4+1+1, optimal 3+3.' } },
    { front: { en: 'Max non-overlapping intervals: sort by…?', hi: 'Max non-overlapping intervals: kis se sort?' }, back: { en: 'End time, taking each compatible interval greedily.', hi: 'End time se — har compatible interval greedily lo.' } },
    { front: { en: 'Tasks with deadlines (points d − finish time): order?', hi: 'Deadlines wale tasks (points d − finish time): order?' }, back: { en: 'By duration, shortest first. The deadlines don’t matter.', hi: 'Duration se, shortest first. Deadlines ka koi role nahi.' } },
    { front: { en: 'Best x for Σ|aᵢ − x|?', hi: 'Σ|aᵢ − x| ke liye best x?' }, back: { en: 'Any median.', hi: 'Koi bhi median.' } },
    { front: { en: 'Huffman: which nodes merge?', hi: 'Huffman: kaunse nodes judte hain?' }, back: { en: 'The two with the smallest weights, repeated n − 1 times.', hi: 'Do sabse chhote weights wale — n − 1 baar.' } },
    { front: { en: 'Prefix-free code means…?', hi: 'Prefix-free code matlab?' }, back: { en: 'No codeword is a prefix of another, so decoding is unique.', hi: 'Koi codeword doosre ka prefix nahi — decoding unique.' } },
  ],
};

export default extras;
