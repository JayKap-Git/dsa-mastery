package ch04;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/** Chapter 4: every C++ STL structure the book uses, as the Java collection you'd reach for. */
public class CollectionsTour {

    // #region list
    static List<Integer> dynamicArray() {
        List<Integer> v = new ArrayList<>(); // vector<int>
        v.add(3); // push_back
        v.add(2);
        v.add(5);
        v.remove(v.size() - 1); // pop_back (by index!)
        return v; // [3, 2]
    }
    // #endregion

    // #region strings
    static String strings() {
        String a = "hatti";
        StringBuilder b = new StringBuilder(a).append(a); // Strings are immutable: build with StringBuilder
        b.setCharAt(5, 'v'); // hattivatti
        return b.substring(3, 3 + 4); // substring(begin, END), not (pos, length): "tiva"
    }
    // #endregion

    // #region sets
    static boolean[] sets() {
        Set<Integer> hash = new HashSet<>(); // unordered_set: O(1) average
        TreeSet<Integer> tree = new TreeSet<>(); // set: ordered, O(log n)
        for (int x : new int[] {3, 2, 5, 5, 5}) {
            hash.add(x);
            tree.add(x); // duplicates are ignored
        }
        tree.remove(3);
        tree.add(4);
        return new boolean[] {hash.contains(3), tree.contains(3), tree.contains(4), tree.size() == 3};
    }
    // #endregion

    // #region multiset
    /** Java has no multiset: count occurrences in a TreeMap instead. */
    static void addOne(TreeMap<Integer, Integer> ms, int x) {
        ms.merge(x, 1, Integer::sum);
    }

    /** Remove ONE copy of x (C++: s.erase(s.find(x))). */
    static void removeOne(TreeMap<Integer, Integer> ms, int x) {
        if (ms.merge(x, -1, Integer::sum) == 0) ms.remove(x);
    }
    // #endregion

    // #region maps
    static Map<String, Integer> maps() {
        Map<String, Integer> m = new HashMap<>(); // unordered_map; TreeMap for map
        m.put("monkey", 4);
        m.put("banana", 3);
        m.put("harpsichord", 9);
        m.merge("banana", 1, Integer::sum); // m["banana"]++  → 4
        int missing = m.getOrDefault("aybabtu", 0); // C++ would INSERT the key here; Java doesn't
        m.put("check", missing);
        return m;
    }
    // #endregion

    // #region navigation
    /** The element of a non-empty set closest to x (ties go to the smaller one). */
    static int nearest(TreeSet<Integer> s, int x) {
        Integer up = s.ceiling(x); // smallest ≥ x   (C++ lower_bound)
        Integer down = s.floor(x); // largest  ≤ x
        if (up == null) return down;
        if (down == null) return up;
        return x - down <= up - x ? down : up;
    }
    // #endregion

    // #region deque
    static int[] stacksAndQueues() {
        Deque<Integer> stack = new ArrayDeque<>(); // stack: push / pop / peek at the front
        stack.push(3);
        stack.push(2);
        stack.push(5);
        int top = stack.pop(); // 5

        Deque<Integer> queue = new ArrayDeque<>(); // queue: offer at the back, poll from the front
        queue.offer(3);
        queue.offer(2);
        queue.offer(5);
        int front = queue.poll(); // 3

        Deque<Integer> d = new ArrayDeque<>(); // deque: both ends
        d.addLast(5);
        d.addLast(2);
        d.addFirst(3); // [3, 5, 2]
        d.pollLast(); // [3, 5]
        d.pollFirst(); // [5]
        return new int[] {top, front, d.peekFirst()};
    }
    // #endregion

    // #region pq
    static int[] priorityQueues() {
        PriorityQueue<Integer> min = new PriorityQueue<>(); // Java's default is a MIN-heap
        PriorityQueue<Integer> max = new PriorityQueue<>(Collections.reverseOrder()); // C++'s default
        for (int x : new int[] {3, 5, 7, 2}) {
            min.add(x);
            max.add(x);
        }
        return new int[] {min.poll(), max.poll(), max.peek()}; // 2, 7, 5
    }
    // #endregion

    // #region bitset
    static String bitsets() {
        BitSet a = BitSet.valueOf(new long[] {0b0010110110L});
        BitSet b = BitSet.valueOf(new long[] {0b1011011000L});
        BitSet and = (BitSet) a.clone();
        and.and(b); // a & b → 0010010000
        return Long.toBinaryString(and.toLongArray()[0]) + " count=" + a.cardinality();
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        check(dynamicArray().equals(List.of(3, 2)), "list");
        check(strings().equals("tiva"), "book: substr(3,4) = tiva");
        boolean[] s = sets();
        check(s[0] && !s[1] && s[2] && s[3], "sets");

        TreeMap<Integer, Integer> ms = new TreeMap<>();
        for (int i = 0; i < 3; i++) addOne(ms, 5);
        removeOne(ms, 5);
        check(ms.get(5) == 2, "multiset: remove only one copy");
        removeOne(ms, 5);
        removeOne(ms, 5);
        check(!ms.containsKey(5), "multiset: empty count removes the key");

        Map<String, Integer> m = maps();
        check(m.get("banana") == 4 && m.get("check") == 0 && !m.containsKey("aybabtu"), "maps");

        TreeSet<Integer> t = new TreeSet<>(List.of(3, 4, 6, 8, 12, 13, 14, 17));
        check(nearest(t, 10) == 8 && nearest(t, 11) == 12 && nearest(t, 1) == 3 && nearest(t, 99) == 17, "nearest");
        check(t.ceiling(9) == 12 && t.higher(12) == 13 && t.lower(3) == null && t.floor(5) == 4, "navigation");
        check(t.first() == 3 && t.last() == 17, "first/last");

        int[] sq = stacksAndQueues();
        check(sq[0] == 5 && sq[1] == 3 && sq[2] == 5, "stack, queue, deque");
        int[] pq = priorityQueues();
        check(pq[0] == 2 && pq[1] == 7 && pq[2] == 5, "priority queues");
        check(bitsets().equals("10010000 count=5"), "bitset: " + bitsets());
        System.out.println("CollectionsTour OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
