package ch06;

import java.util.Arrays;

/** §6.1 The coin problem: greedy (largest coin first) is optimal for euro coins, but not for every coin set. */
public class CoinGreedy {

    // #region greedy
    /** Coins in increasing order; returns how many of each coin greedy takes, or null if it gets stuck. */
    static int[] greedy(int[] coins, int n) {
        int[] used = new int[coins.length];
        for (int i = coins.length - 1; i >= 0; i--) { // @step coin
            while (n >= coins[i]) { // @step take
                n -= coins[i];
                used[i]++;
            }
        }
        return n == 0 ? used : null; // @step done
    }
    // #endregion

    /** Reference answer (dynamic programming, chapter 7). */
    static int optimal(int[] coins, int n) {
        int[] best = new int[n + 1];
        Arrays.fill(best, Integer.MAX_VALUE);
        best[0] = 0;
        for (int x = 1; x <= n; x++)
            for (int c : coins)
                if (c <= x && best[x - c] != Integer.MAX_VALUE) best[x] = Math.min(best[x], best[x - c] + 1);
        return best[n];
    }

    static int count(int[] used) {
        return Arrays.stream(used).sum();
    }

    public static void main(String[] args) { // @selftest
        int[] euro = {1, 2, 5, 10, 20, 50, 100, 200};
        int[] g = greedy(euro, 520);
        check(count(g) == 4 && g[7] == 2 && g[6] == 1 && g[4] == 1, "book: 520 = 200+200+100+20");
        for (int n = 1; n <= 2000; n++) check(count(greedy(euro, n)) == optimal(euro, n), "euro coins: greedy is optimal at " + n);
        int[] odd = {1, 3, 4};
        check(count(greedy(odd, 6)) == 3 && optimal(odd, 6) == 2, "book counterexample: greedy 4+1+1, optimal 3+3");
        System.out.println("CoinGreedy OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
