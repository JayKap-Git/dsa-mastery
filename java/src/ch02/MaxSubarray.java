package ch02;

import java.util.Random;

/** §2.4 Maximum subarray sum: the same answer in O(n³), O(n²) and O(n). Empty subarray allowed (answer ≥ 0). */
public class MaxSubarray {

    // #region cubic
    static long cubic(int[] a) {
        int n = a.length;
        long best = 0;
        for (int x = 0; x < n; x++) {
            for (int y = x; y < n; y++) {
                long sum = 0;
                for (int k = x; k <= y; k++) {
                    sum += a[k];
                }
                best = Math.max(best, sum);
            }
        }
        return best;
    }
    // #endregion

    // #region quadratic
    static long quadratic(int[] a) {
        int n = a.length;
        long best = 0;
        for (int x = 0; x < n; x++) {
            long sum = 0;
            for (int y = x; y < n; y++) {
                sum += a[y]; // extend the subarray instead of re-adding it
                best = Math.max(best, sum);
            }
        }
        return best;
    }
    // #endregion

    // #region kadane
    /** Kadane: sum = best subarray sum ending exactly at k. */
    static long kadane(int[] a) {
        long best = 0, sum = 0;
        for (int k = 0; k < a.length; k++) {
            sum = Math.max(a[k], sum + a[k]); // @step extend
            best = Math.max(best, sum); // @step best
        }
        return best; // @step done
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] book = {-1, 2, 4, -3, 5, 2, -5, 2};
        check(cubic(book) == 10 && quadratic(book) == 10 && kadane(book) == 10, "book example = 10");
        check(kadane(new int[] {-3, -1, -2}) == 0, "all negative → empty subarray (0)");
        Random rnd = new Random(2);
        for (int it = 0; it < 2000; it++) {
            int n = rnd.nextInt(30);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(41) - 20;
            long c = cubic(a);
            check(quadratic(a) == c && kadane(a) == c, "all three agree");
        }
        System.out.println("MaxSubarray OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
