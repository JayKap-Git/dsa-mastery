package ch07;

import java.util.Random;

/** §7.4 Knapsack: which sums can a subset of the weights make? Plus the weights-and-values version. */
public class Knapsack {

    // #region table
    /** possible[k][x]: can the first k weights make the sum x? (w is 1-indexed) */
    static boolean[][] table(int[] w, int n, int W) {
        boolean[][] possible = new boolean[n + 1][W + 1];
        possible[0][0] = true;
        for (int k = 1; k <= n; k++) {
            for (int x = 0; x <= W; x++) {
                if (x - w[k] >= 0 && possible[k - 1][x - w[k]]) possible[k][x] = true; // @step use
                if (possible[k - 1][x]) possible[k][x] = true; // @step skip
            }
        }
        return possible;
    }
    // #endregion

    // #region oned
    /** One array, updated from right to left so each weight is used at most once. */
    static boolean[] sums(int[] w, int W) {
        boolean[] possible = new boolean[W + 1];
        possible[0] = true;
        for (int wk : w) {
            for (int x = W - wk; x >= 0; x--) {
                if (possible[x]) possible[x + wk] = true;
            }
        }
        return possible;
    }
    // #endregion

    // #region values
    /** 0/1 knapsack: the largest total value with total weight ≤ cap. */
    static long bestValue(int[] weight, int[] value, int cap) {
        long[] best = new long[cap + 1];
        for (int i = 0; i < weight.length; i++) {
            for (int c = cap; c >= weight[i]; c--) {
                best[c] = Math.max(best[c], best[c - weight[i]] + value[i]);
            }
        }
        return best[cap];
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] w = {1, 3, 3, 5};
        boolean[] s = sums(w, 12);
        for (int x = 0; x <= 12; x++) check(s[x] == (x != 2 && x != 10), "book: all of 0..12 except 2 and 10");
        boolean[][] t = table(new int[] {0, 1, 3, 3, 5}, 4, 12);
        for (int x = 0; x <= 12; x++) check(t[4][x] == s[x], "table = 1-D version");
        Random rnd = new Random(74);
        for (int it = 0; it < 500; it++) {
            int n = 1 + rnd.nextInt(10);
            int[] ws = new int[n], vs = new int[n];
            for (int i = 0; i < n; i++) { ws[i] = 1 + rnd.nextInt(10); vs[i] = rnd.nextInt(20); }
            int cap = rnd.nextInt(40);
            long brute = 0;
            boolean[] reach = new boolean[n * 10 + 1];
            for (int m = 0; m < 1 << n; m++) {
                int tw = 0; long tv = 0;
                for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) { tw += ws[i]; tv += vs[i]; }
                reach[tw] = true;
                if (tw <= cap) brute = Math.max(brute, tv);
            }
            check(bestValue(ws, vs, cap) == brute, "0/1 knapsack value");
            boolean[] got = sums(ws, n * 10);
            for (int x = 0; x <= n * 10; x++) check(got[x] == reach[x], "subset sums");
        }
        System.out.println("Knapsack OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
