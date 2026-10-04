package ch07;

import java.util.Arrays;
import java.util.Random;

/** §7.2 Longest increasing subsequence: O(n²) DP, and the O(n log n) version the book leaves as an exercise. */
public class LIS {

    // #region quadratic
    /** length[k] = longest increasing subsequence that ends exactly at position k. */
    static int[] lengths(int[] a) {
        int n = a.length;
        int[] length = new int[n];
        for (int k = 0; k < n; k++) {
            length[k] = 1; // @step start
            for (int i = 0; i < k; i++) { // @step compare
                if (a[i] < a[k]) {
                    length[k] = Math.max(length[k], length[i] + 1); // @step extend
                }
            }
        }
        return length;
    }
    // #endregion

    // #region fast
    /** tails[L] = the smallest possible last element of an increasing subsequence of length L + 1. */
    static int lisFast(int[] a) {
        int[] tails = new int[a.length];
        int len = 0;
        for (int x : a) {
            int lo = 0, hi = len; // first tail ≥ x (lower bound)
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] >= x) hi = mid;
                else lo = mid + 1;
            }
            tails[lo] = x; // x either extends the longest run or improves a tail
            if (lo == len) len++;
        }
        return len;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] book = {6, 2, 5, 1, 7, 4, 8, 3};
        check(Arrays.equals(lengths(book), new int[] {1, 1, 2, 1, 3, 2, 4, 2}), "book lengths");
        check(lisFast(book) == 4, "book LIS = 4");
        Random rnd = new Random(72);
        for (int it = 0; it < 2000; it++) {
            int n = rnd.nextInt(30);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(20);
            int slow = Arrays.stream(lengths(a)).max().orElse(0);
            check(lisFast(a) == slow, "O(n log n) = O(n²)");
        }
        System.out.println("LIS OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
