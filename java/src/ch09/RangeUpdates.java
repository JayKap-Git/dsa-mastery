package ch09;

import java.util.Arrays;
import java.util.Random;

/** §9.4 Range updates with a difference array, and the O(log n) version on a Fenwick tree. */
public class RangeUpdates {

    // #region diff
    /** d[0] = arr[0], d[k] = arr[k] - arr[k - 1] */
    static long[] difference(int[] arr) {
        long[] d = new long[arr.length];
        for (int k = 0; k < arr.length; k++) {
            d[k] = arr[k] - (k > 0 ? arr[k - 1] : 0); // @step diff
        }
        return d;
    }

    /** Adds x to every arr[a..b] by touching just two cells of d. */
    static void rangeAdd(long[] d, int a, int b, long x) {
        d[a] += x; // @step left
        if (b + 1 < d.length) d[b + 1] -= x; // @step right
    }

    /** The original array is the prefix-sum array of d. */
    static long[] restore(long[] d) {
        long[] arr = new long[d.length];
        for (int k = 0; k < d.length; k++) {
            arr[k] = (k > 0 ? arr[k - 1] : 0) + d[k]; // @step restore
        }
        return arr;
    }
    // #endregion

    // #region bit
    /** Range add + point query, both O(log n): a Fenwick tree over the difference array (1-indexed). */
    static class RangeAddPointQuery {
        final FenwickTree bit;

        RangeAddPointQuery(int n) {
            bit = new FenwickTree(n + 1); // room for position b + 1 = n + 1
        }

        void rangeAdd(int a, int b, long x) {
            bit.add(a, x);
            bit.add(b + 1, -x);
        }

        long get(int k) {
            return bit.sum(k); // arr[k] = d[1] + ... + d[k]
        }
    }
    // #endregion

    public static void main(String[] args) {
        // Book example: [3, 3, 1, 1, 1, 5, 2, 2] → d = [3, 0, -2, 0, 0, 4, -3, 0];
        // adding 5 to positions 1..4 gives d = [3, 5, -2, 0, 0, -1, -3, 0]
        long[] d = difference(new int[] {3, 3, 1, 1, 1, 5, 2, 2});
        check(Arrays.equals(d, new long[] {3, 0, -2, 0, 0, 4, -3, 0}), "book difference array");
        rangeAdd(d, 1, 4, 5);
        check(Arrays.equals(d, new long[] {3, 5, -2, 0, 0, -1, -3, 0}), "book range update");
        check(Arrays.equals(restore(d), new long[] {3, 8, 6, 6, 6, 5, 2, 2}), "restored array");

        Random rnd = new Random(97);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(20);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(21) - 10;
            long[] brute = new long[n];
            for (int i = 0; i < n; i++) brute[i] = a[i];
            long[] dd = difference(a);
            RangeAddPointQuery rq = new RangeAddPointQuery(n);
            for (int i = 0; i < n; i++) rq.rangeAdd(i + 1, i + 1, a[i]);
            for (int q = 0; q < 20; q++) {
                int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x), v = rnd.nextInt(21) - 10;
                for (int i = x; i <= y; i++) brute[i] += v;
                rangeAdd(dd, x, y, v);
                rq.rangeAdd(x + 1, y + 1, v);
            }
            check(Arrays.equals(restore(dd), brute), "difference array matches brute force");
            for (int i = 0; i < n; i++) check(rq.get(i + 1) == brute[i], "Fenwick point query");
        }
        System.out.println("RangeUpdates OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
