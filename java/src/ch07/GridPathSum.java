package ch07;

import java.util.Random;

/** §7.3 Paths in a grid: the largest sum on a path from the upper-left to the lower-right, moving down/right. */
public class GridPathSum {

    // #region maxsum
    /** value is 1-indexed: value[1..n][1..n]; row 0 and column 0 are 0 so the edges need no special case. */
    static long[][] sums(int[][] value, int n) {
        long[][] sum = new long[n + 1][n + 1];
        for (int y = 1; y <= n; y++) {
            for (int x = 1; x <= n; x++) {
                sum[y][x] = Math.max(sum[y][x - 1], sum[y - 1][x]) + value[y][x]; // @step cell
            }
        }
        return sum;
    }
    // #endregion

    static long brute(int[][] v, int n, int y, int x) {
        if (y == n && x == n) return v[y][x];
        long best = Long.MIN_VALUE;
        if (y < n) best = Math.max(best, brute(v, n, y + 1, x));
        if (x < n) best = Math.max(best, brute(v, n, y, x + 1));
        return best + v[y][x];
    }

    public static void main(String[] args) { // @selftest
        int[][] g = {{3, 7, 9, 2, 7}, {9, 8, 3, 5, 5}, {1, 7, 9, 8, 5}, {3, 8, 6, 4, 10}, {6, 3, 9, 7, 8}};
        int[][] v = new int[6][6];
        for (int y = 1; y <= 5; y++) for (int x = 1; x <= 5; x++) v[y][x] = g[y - 1][x - 1];
        check(sums(v, 5)[5][5] == 67, "book: 67");
        Random rnd = new Random(73);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(6);
            int[][] w = new int[n + 1][n + 1];
            for (int y = 1; y <= n; y++) for (int x = 1; x <= n; x++) w[y][x] = 1 + rnd.nextInt(9);
            check(sums(w, n)[n][n] == brute(w, n, 1, 1), "matches all paths");
        }
        System.out.println("GridPathSum OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
