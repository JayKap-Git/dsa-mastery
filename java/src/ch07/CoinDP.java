package ch07;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** §7.1 The coin problem done right: recursion → memoization → iteration, plus reconstruction and counting. */
public class CoinDP {
    static final int INF = Integer.MAX_VALUE / 2;
    static int[] coins;

    // #region recursive
    /** Correct, but exponential: the same sums are recomputed over and over. */
    static int solveSlow(int x) {
        if (x < 0) return INF;
        if (x == 0) return 0;
        int best = INF;
        for (int c : coins) best = Math.min(best, solveSlow(x - c) + 1);
        return best;
    }
    // #endregion

    // #region memo
    static boolean[] ready;
    static int[] value;

    /** Same recursion, but each solve(x) is computed once and remembered: O(n·k). */
    static int solve(int x) {
        if (x < 0) return INF;
        if (x == 0) return 0;
        if (ready[x]) return value[x];
        int best = INF;
        for (int c : coins) best = Math.min(best, solve(x - c) + 1);
        value[x] = best;
        ready[x] = true;
        return best;
    }
    // #endregion

    // #region iterative
    /** Bottom-up: fill value[0..n] in increasing order. Also records the first coin of an optimal solution. */
    static int[] first;

    static int minCoins(int n) {
        int[] best = new int[n + 1];
        first = new int[n + 1];
        best[0] = 0;
        for (int x = 1; x <= n; x++) { // @step sum
            best[x] = INF;
            for (int c : coins) { // @step coin
                if (x - c >= 0 && best[x - c] + 1 < best[x]) { // @step coin
                    best[x] = best[x - c] + 1; // @step better
                    first[x] = c; // @step better
                }
            }
        }
        return best[n]; // @step done
    }
    // #endregion

    // #region construct
    static List<Integer> construct(int n) {
        List<Integer> used = new ArrayList<>();
        while (n > 0) {
            used.add(first[n]);
            n -= first[n];
        }
        return used;
    }
    // #endregion

    // #region count
    static final int MOD = 1_000_000_007;

    /** Ordered ways to form each sum: count[x] = Σ count[x − c]. */
    static long ways(int n) {
        long[] count = new long[n + 1];
        count[0] = 1;
        for (int x = 1; x <= n; x++) { // @step sum
            for (int c : coins) { // @step coin
                if (x - c >= 0) {
                    count[x] = (count[x] + count[x - c]) % MOD; // @step add
                }
            }
        }
        return count[n]; // @step done
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        coins = new int[] {1, 3, 4};
        int[] book = {0, 1, 2, 1, 1, 2, 2, 2, 2, 3, 3};
        for (int x = 0; x <= 10; x++) check(solveSlow(x) == book[x], "book solve(" + x + ")");
        ready = new boolean[1001];
        value = new int[1001];
        for (int x = 0; x <= 1000; x++) check(solve(x) == minCoins(x), "memo = iterative at " + x);
        minCoins(10);
        List<Integer> sol = construct(10);
        check(sol.size() == 3 && sol.stream().mapToInt(Integer::intValue).sum() == 10, "book: 10 = 3 + 3 + 4");
        check(ways(5) == 6, "book: 6 ways to make 5");
        coins = new int[] {2, 5};
        check(minCoins(3) >= INF, "3 cannot be made from {2, 5}");
        check(Arrays.equals(new long[] {ways(1), ways(2), ways(7)}, new long[] {0, 1, 2}), "counting with {2, 5}: 7 = 2+5 = 5+2");
        System.out.println("CoinDP OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
