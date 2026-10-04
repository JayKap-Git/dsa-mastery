package ch03;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

/** §3.2 Sorting in Java: the library calls that replace C++ sort, and their traps. */
public class JavaSorting {

    // #region primitives
    /**
     * Arrays.sort(int[]) is a quicksort. On older Java versions a crafted test can make it O(n²)
     * ("anti-quicksort" hacks), so shuffle first; it costs O(n) and removes the bad case.
     */
    static void safeSort(int[] a) {
        Random rnd = new Random();
        for (int i = a.length - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
        Arrays.sort(a);
    }
    // #endregion

    // #region reverse
    static Integer[] descending(int[] a) {
        Integer[] boxed = Arrays.stream(a).boxed().toArray(Integer[]::new);
        Arrays.sort(boxed, Collections.reverseOrder()); // objects: a merge sort, always O(n log n)
        return boxed;
    }
    // #endregion

    // #region pairs
    /** C++ sorts pair<int,int> by first, then second. In Java, say so with a comparator. */
    static void sortPairs(int[][] pairs) {
        Arrays.sort(pairs, (p, q) -> p[0] != q[0] ? Integer.compare(p[0], q[0]) : Integer.compare(p[1], q[1]));
    }
    // #endregion

    // #region comparable
    /** A point that knows its own order: by x, then by y (C++'s operator<). */
    static class Point implements Comparable<Point> {
        final int x, y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public int compareTo(Point o) {
            if (x != o.x) return Integer.compare(x, o.x);
            return Integer.compare(y, o.y);
        }
    }
    // #endregion

    // #region comparator
    /** Strings by length, then alphabetically (the book's comp function). */
    static void byLengthThenAlpha(List<String> words) {
        words.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] v = {4, 2, 5, 3, 5, 8, 3};
        safeSort(v);
        check(Arrays.equals(v, new int[] {2, 3, 3, 4, 5, 5, 8}), "book vector");
        check(Arrays.equals(descending(new int[] {4, 2, 5}), new Integer[] {5, 4, 2}), "reverse order");

        char[] s = "monkey".toCharArray();
        Arrays.sort(s);
        check(new String(s).equals("ekmnoy"), "book: sorting a string");

        int[][] pairs = {{1, 5}, {2, 3}, {1, 2}};
        sortPairs(pairs);
        check(Arrays.deepEquals(pairs, new int[][] {{1, 2}, {1, 5}, {2, 3}}), "book: pairs");

        List<Point> pts = new ArrayList<>(List.of(new Point(2, 1), new Point(1, 5), new Point(2, 0)));
        Collections.sort(pts);
        check(pts.get(0).x == 1 && pts.get(1).y == 0 && pts.get(2).y == 1, "Comparable points");

        List<String> words = new ArrayList<>(List.of("pear", "fig", "apple", "kiwi", "date"));
        byLengthThenAlpha(words);
        check(words.equals(List.of("fig", "date", "kiwi", "pear", "apple")), "length then alpha");

        // Integer overflow trap in comparators: never write (p, q) -> p - q.
        Integer[] big = {Integer.MIN_VALUE, 1};
        Arrays.sort(big, (p, q) -> p - q); // MIN_VALUE - 1 overflows to MAX_VALUE: wrong order!
        check(big[0] == 1, "p - q comparator really is broken");
        Arrays.sort(big, Integer::compare);
        check(big[0] == Integer.MIN_VALUE, "Integer.compare is safe");
        System.out.println("JavaSorting OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
