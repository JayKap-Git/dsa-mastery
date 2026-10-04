import type { ChapterExtras } from '../types';

const extras: ChapterExtras = {
  quiz: [
    {
      kind: 'java',
      q: { en: 'new PriorityQueue<Integer>() then add 3, 5, 7, 2. What does poll() return?', hi: 'new PriorityQueue<Integer>() mein 3, 5, 7, 2 add kiye. poll() kya dega?' },
      options: ['2', '7', '3', { en: 'It depends on insertion order', hi: 'Insertion order pe depend' }],
      answer: 0,
      explain: { en: 'Java’s PriorityQueue is a min-heap by default, the opposite of C++. Use Collections.reverseOrder() for a max-heap.', hi: 'Java ka PriorityQueue default min-heap hai (C++ ka ulta). Max-heap ke liye Collections.reverseOrder().' },
    },
    {
      kind: 'java',
      q: { en: 'Which TreeSet method matches C++ s.lower_bound(x)?', hi: 'C++ ke s.lower_bound(x) jaisa TreeSet method kaunsa?' },
      options: ['ceiling(x)', 'floor(x)', 'higher(x)', 'lower(x)'],
      answer: 0,
      explain: { en: 'lower_bound is the smallest element ≥ x, which is ceiling. upper_bound (> x) is higher.', hi: 'lower_bound = ≥ x mein sabse chhota = ceiling. upper_bound (> x) = higher.' },
    },
    {
      kind: 'java',
      q: { en: 'List<Integer> list = [5, 7, 1]. After list.remove(1), the list is…', hi: 'List<Integer> list = [5, 7, 1]. list.remove(1) ke baad list?' },
      options: ['[5, 1]', '[5, 7]', '[7, 1]', { en: 'Compile error', hi: 'Compile error' }],
      answer: 0,
      explain: { en: 'remove(int) removes by index, so element 7 at index 1 goes. Use remove(Integer.valueOf(1)) to remove the value 1.', hi: 'remove(int) index se hatata hai — index 1 wala 7 gaya. Value 1 hatani ho toh remove(Integer.valueOf(1)).' },
    },
    {
      kind: 'java',
      q: { en: 'Map<String, Integer> m = new HashMap<>(); int c = m.get("x"); What happens?', hi: 'Map<String, Integer> m = new HashMap<>(); int c = m.get("x"); kya hoga?' },
      options: [
        { en: 'NullPointerException: get returns null, which can’t be unboxed to int', hi: 'NullPointerException — get null deta hai, jo int mein unbox nahi hota' },
        { en: 'c = 0 and the key is inserted, like in C++', hi: 'c = 0 aur key insert ho jaati hai, C++ jaisa' },
        { en: 'c = 0 and nothing is inserted', hi: 'c = 0, kuch insert nahi' },
        { en: 'Compile error', hi: 'Compile error' },
      ],
      answer: 0,
      explain: { en: 'Use getOrDefault("x", 0). Java never auto-inserts on read.', hi: 'getOrDefault("x", 0) use karo. Java padhne pe kabhi auto-insert nahi karta.' },
    },
    {
      kind: 'concept',
      q: { en: 'How do you get a multiset in Java?', hi: 'Java mein multiset kaise banaoge?' },
      options: [
        { en: 'TreeMap<value, count>: merge to add, decrement and remove at 0', hi: 'TreeMap<value, count>: add ke liye merge, ghatao aur 0 pe hatao' },
        { en: 'TreeSet allows duplicates if you add twice', hi: 'TreeSet do baar add karne pe duplicates rakhta hai' },
        { en: 'java.util.MultiSet', hi: 'java.util.MultiSet' },
        { en: 'HashSet with a flag', hi: 'Flag ke saath HashSet' },
      ],
      answer: 0,
      explain: { en: 'There’s no MultiSet class, and TreeSet drops duplicates. Count them in a TreeMap so the keys stay sorted.', hi: 'MultiSet class nahi hai, aur TreeSet duplicates gira deta hai. TreeMap mein gino — keys sorted rehti hain.' },
    },
    {
      kind: 'concept',
      q: { en: 'Why did "sort both lists + two pointers" beat a TreeSet with the same O(n log n)?', hi: '"Dono lists sort + two pointers" same O(n log n) hote hue TreeSet se tez kyun?' },
      options: [
        { en: 'Sorting has a much smaller constant; the tree pays per operation (and boxes in Java)', hi: 'Sorting ka constant bahut chhota; tree har operation pe kharcha karta hai (Java mein boxing bhi)' },
        { en: 'Sorting is actually O(n)', hi: 'Sorting asal mein O(n) hai' },
        { en: 'TreeSet is O(n²)', hi: 'TreeSet O(n²) hai' },
        { en: 'Measurement error', hi: 'Measurement error' },
      ],
      answer: 0,
      explain: { en: 'Complexity hides constants. One sort plus a linear scan beats n balanced-tree operations.', hi: 'Complexity constants chhupa leti hai. Ek sort + linear scan, n balanced-tree operations se tez.' },
    },
  ],

  practice: [
    { id: 1619, name: 'Restaurant Customers', level: 'easy', section: '4.6', note: { en: 'Sort arrival and leave events, then sweep and count.', hi: 'Arrival aur leave events sort karo, phir sweep karke gino.' } },
    { id: 1141, name: 'Playlist', level: 'medium', section: '4.3', note: { en: 'Two pointers plus a HashMap of each value’s last position.', hi: 'Two pointers + har value ki aakhri position ka HashMap.' } },
    { id: 1091, name: 'Concert Tickets', level: 'medium', section: '4.4', note: { en: 'Multiset as TreeMap counts; floorKey(maxPrice).', hi: 'TreeMap counts wala multiset; floorKey(maxPrice).' } },
    { id: 1073, name: 'Towers', level: 'medium', section: '4.4', note: { en: 'Multiset of tower tops: higherKey(x), replace it with x.', hi: 'Tower tops ka multiset: higherKey(x), use x se badlo.' } },
    { id: 1164, name: 'Room Allocation', level: 'medium', section: '4.5', note: { en: 'Sort by arrival; a min-heap of (free time, room).', hi: 'Arrival se sort; (free time, room) ka min-heap.' } },
    { id: 1163, name: 'Traffic Lights', level: 'hard', section: '4.4', note: { en: 'TreeSet of light positions plus a multiset of gaps.', hi: 'Lights ki positions ka TreeSet + gaps ka multiset.' } },
  ],

  cheatsheet: [
    { title: 'STL → Java', body: { en: 'vector→ArrayList, set→TreeSet, unordered_set→HashSet, map→TreeMap, unordered_map→HashMap, deque/stack/queue→ArrayDeque, priority_queue→PriorityQueue (min!), bitset→BitSet.', hi: 'vector→ArrayList, set→TreeSet, unordered_set→HashSet, map→TreeMap, unordered_map→HashMap, deque/stack/queue→ArrayDeque, priority_queue→PriorityQueue (min!), bitset→BitSet.' } },
    { title: 'Navigation', body: { en: '`ceiling` (≥ x), `higher` (> x), `floor` (≤ x), `lower` (< x), `first`, `last`. All O(log n), returning null when nothing matches.', hi: '`ceiling` (≥ x), `higher` (> x), `floor` (≤ x), `lower` (< x), `first`, `last` — sab O(log n), kuch na mile toh null.' } },
    { title: 'Multiset', body: { en: '`TreeMap<Integer,Integer>`: `merge(x, 1, Integer::sum)`; remove one copy by decrementing, and drop the key at 0.', hi: '`TreeMap<Integer,Integer>`: `merge(x, 1, Integer::sum)`; ek copy hatane ke liye ghatao, 0 pe key hatao.' } },
    { title: 'Traps', body: { en: '`remove(int)` removes by index; `get` returns null; `PriorityQueue` is a min-heap; `headSet(x).size()` is O(n); boxing is slow.', hi: '`remove(int)` index se hatata hai; `get` null deta hai; `PriorityQueue` min-heap; `headSet(x).size()` O(n); boxing slow.' } },
    { title: 'Prefer sorting', body: { en: 'If one sort + a linear scan solves it, that usually beats a set or map with the same O(n log n).', hi: 'Agar ek sort + linear scan se kaam ho jaaye, toh woh aksar same O(n log n) wale set/map se tez hai.' } },
  ],

  flashcards: [
    { front: { en: 'Max-heap in Java?', hi: 'Java mein max-heap?' }, back: { en: '`new PriorityQueue<>(Collections.reverseOrder())`', hi: '`new PriorityQueue<>(Collections.reverseOrder())`' } },
    { front: { en: 'C++ upper_bound on a set → Java?', hi: 'Set pe C++ upper_bound → Java?' }, back: { en: '`treeSet.higher(x)`: the smallest element > x, or null.', hi: '`treeSet.higher(x)` — x se bada sabse chhota, ya null.' } },
    { front: { en: 'Stack and queue in Java?', hi: 'Java mein stack aur queue?' }, back: { en: '`ArrayDeque`: push/pop for a stack, offer/poll for a queue.', hi: '`ArrayDeque` — stack ke liye push/pop, queue ke liye offer/poll.' } },
    { front: { en: 'Safely read a count from a HashMap?', hi: 'HashMap se count safely kaise padhein?' }, back: { en: '`m.getOrDefault(key, 0)`', hi: '`m.getOrDefault(key, 0)`' } },
    { front: { en: 'k-th smallest element of a dynamic set in Java?', hi: 'Java mein dynamic set ka k-th smallest?' }, back: { en: 'Compress the values and walk down a Fenwick tree; there’s no built-in indexed set.', hi: 'Values compress karke Fenwick tree — built-in indexed set nahi hai.' } },
  ],
};

export default extras;
