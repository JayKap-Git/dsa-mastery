package ch10;

import java.util.Arrays;
import java.util.Random;

/** §10.5 Dynamic programming over subsets: the state is a set, stored as a bitmask. */
public class BitmaskDP {

    static final int INF = Integer.MAX_VALUE;

    // #region selection
    /** price[x][d] = price of product x on day d. Buy every product once, at most one per day. O(n·2^k·k). */
    static int[][] selection(int[][] price) {
        int k = price.length, n = price[0].length;
        int[][] total = new int[1 << k][n];
        for (int[] t : total) Arrays.fill(t, INF);
        total[0][0] = 0;
        for (int x = 0; x < k; x++) total[1 << x][0] = price[x][0];
        for (int d = 1; d < n; d++) {
            for (int s = 0; s < (1 << k); s++) {
                total[s][d] = total[s][d - 1]; // @step skip
                for (int x = 0; x < k; x++) {
                    if ((s & (1 << x)) != 0 && total[s ^ (1 << x)][d - 1] != INF) {
                        total[s][d] = Math.min(total[s][d], total[s ^ (1 << x)][d - 1] + price[x][d]); // @step buy
                    }
                }
            }
        }
        return total; // the answer is total[(1 << k) - 1][n - 1]
    }
    // #endregion

    // #region elevator
    /** best[s] = {rides, weight of the last ride} for the people in s, over all orders. O(2^n·n). */
    static int[][] elevator(int[] weight, int x) {
        int n = weight.length;
        int[][] best = new int[1 << n][];
        best[0] = new int[] {1, 0};
        for (int s = 1; s < (1 << n); s++) {
            best[s] = new int[] {n + 1, 0};
            for (int p = 0; p < n; p++) {
                if ((s & (1 << p)) == 0) continue;
                // p is the last person to enter; everyone else in s rode before
                int rides = best[s ^ (1 << p)][0], last = best[s ^ (1 << p)][1]; // @step option
                if (last + weight[p] <= x) {
                    last += weight[p]; // @step join
                } else {
                    rides++; // @step newRide
                    last = weight[p];
                }
                if (rides < best[s][0] || (rides == best[s][0] && last < best[s][1])) {
                    best[s] = new int[] {rides, last}; // @step better
                }
            }
        }
        return best; // the answer is best[(1 << n) - 1][0]
    }
    // #endregion

    // #region sos
    /** sum[s] = the sum of value[a] over all subsets a of s. O(2^n·n) instead of O(4^n). */
    static long[] subsetSums(long[] value, int n) {
        long[] sum = value.clone();
        for (int k = 0; k < n; k++) {
            for (int s = 0; s < (1 << n); s++) {
                if ((s & (1 << k)) != 0) sum[s] += sum[s ^ (1 << k)]; // @step add
            }
        }
        return sum;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[][] price = {{6, 9, 5, 2, 8, 9, 1, 6}, {8, 2, 6, 2, 7, 5, 7, 2}, {5, 3, 9, 7, 3, 5, 1, 4}};
        check(selection(price)[7][7] == 5, "book: minimum total price 5");
        int[] w = {2, 3, 3, 5, 6};
        int[][] best = elevator(w, 10);
        check(best[31][0] == 2, "book: 2 rides");
        check(Arrays.equals(best[(1 << 1) | (1 << 3) | (1 << 4)], new int[] {2, 5}), "book: rides({1,3,4}) = 2, last = 5");
        long[] sum = subsetSums(new long[] {3, 1, 4, 5, 5, 1, 3, 3}, 3);
        check(sum[0b101] == 10, "book: sum({0,2}) = 10");

        Random rnd = new Random(105);
        for (int it = 0; it < 300; it++) {
            int k = 1 + rnd.nextInt(3), n = k + rnd.nextInt(4);
            int[][] p = new int[k][n];
            for (int[] r : p) for (int d = 0; d < n; d++) r[d] = 1 + rnd.nextInt(9);
            check(selection(p)[(1 << k) - 1][n - 1] == bruteSelection(p, 0, new boolean[n]), "selection = try every assignment");

            int m = 1 + rnd.nextInt(6), cap = 6 + rnd.nextInt(8);
            int[] wt = new int[m];
            for (int i = 0; i < m; i++) wt[i] = 1 + rnd.nextInt(cap);
            check(elevator(wt, cap)[(1 << m) - 1][0] == bruteRides(wt, cap, new int[m], 0, new boolean[m]), "rides = try every order");

            int bits = rnd.nextInt(6);
            long[] v = new long[1 << bits];
            for (int s = 0; s < v.length; s++) v[s] = rnd.nextInt(19) - 9;
            long[] fast = subsetSums(v, bits);
            for (int s = 0; s < v.length; s++) {
                long slow = 0;
                for (int a = 0; a < v.length; a++) if ((a & ~s) == 0) slow += v[a];
                check(fast[s] == slow, "sum over subsets = O(4^n) loop");
            }
        }
        System.out.println("BitmaskDP OK");
    }

    /** Give products x.. a distinct day each. */
    static int bruteSelection(int[][] p, int x, boolean[] used) {
        if (x == p.length) return 0;
        int best = INF;
        for (int d = 0; d < used.length; d++) {
            if (used[d]) continue;
            used[d] = true;
            int rest = bruteSelection(p, x + 1, used);
            if (rest != INF) best = Math.min(best, p[x][d] + rest);
            used[d] = false;
        }
        return best;
    }

    /** Fill order[i..] with every remaining person, then simulate the rides for that order. */
    static int bruteRides(int[] w, int cap, int[] order, int i, boolean[] used) {
        if (i == w.length) {
            int rides = 1, load = 0;
            for (int p : order) {
                if (load + w[p] <= cap) load += w[p];
                else { rides++; load = w[p]; }
            }
            return rides;
        }
        int best = Integer.MAX_VALUE;
        for (int p = 0; p < w.length; p++) {
            if (used[p]) continue;
            used[p] = true;
            order[i] = p;
            best = Math.min(best, bruteRides(w, cap, order, i + 1, used));
            used[p] = false;
        }
        return best;
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
