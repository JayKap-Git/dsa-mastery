package ch06;

import java.util.Arrays;
import java.util.Random;

/** §6.4 Choose x to minimise Σ|aᵢ − x| (answer: a median) or Σ(aᵢ − x)² (answer: the mean). */
public class MinimizingSums {

    // #region median
    static long bestAbs(int[] a) {
        int[] s = a.clone();
        Arrays.sort(s);
        long x = s[s.length / 2]; // a median
        long total = 0;
        for (int v : a) total += Math.abs(v - x);
        return total;
    }
    // #endregion

    // #region mean
    /** Over the reals the best x is the mean s/n. If x must be an integer, check ⌊mean⌋ and ⌈mean⌉. */
    static double bestSquares(int[] a) {
        double mean = Arrays.stream(a).average().orElse(0);
        double total = 0;
        for (int v : a) total += (v - mean) * (v - mean);
        return total;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] book = {1, 2, 9, 2, 6};
        check(bestAbs(book) == 12, "book: median 2 gives 12");
        check(Math.abs(bestSquares(book) - 46) < 1e-9, "book: mean 4 gives 46");
        Random rnd = new Random(64);
        for (int it = 0; it < 2000; it++) {
            int n = 1 + rnd.nextInt(9);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(41) - 20;
            long bestA = Long.MAX_VALUE;
            double bestS = Double.MAX_VALUE;
            for (int x10 = -2000; x10 <= 2000; x10++) {
                double x = x10 / 100.0;
                double sa = 0, ss = 0;
                for (int v : a) { sa += Math.abs(v - x); ss += (v - x) * (v - x); }
                if (x10 % 100 == 0) bestA = Math.min(bestA, Math.round(sa));
                bestS = Math.min(bestS, ss);
            }
            check(bestAbs(a) == bestA, "median minimises Σ|a − x|");
            check(bestSquares(a) <= bestS + 1e-9, "mean minimises Σ(a − x)²");
        }
        System.out.println("MinimizingSums OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
