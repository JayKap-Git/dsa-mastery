package ch09;

import java.util.Random;

/** §9.1 Static sum queries with 1D and 2D prefix sums. */
public class PrefixSums {

    // #region build
    /** p[k] = arr[0] + arr[1] + ... + arr[k] */
    static long[] build(int[] arr) {
        long[] p = new long[arr.length];
        for (int k = 0; k < arr.length; k++) {
            p[k] = (k > 0 ? p[k - 1] : 0) + arr[k]; // @step fill
        }
        return p;
    }
    // #endregion

    // #region query
    /** sumq(a, b) in O(1). sumq(0, -1) counts as 0, so a = 0 needs no special case. */
    static long sumq(long[] p, int a, int b) {
        return p[b] - (a > 0 ? p[a - 1] : 0); // @step answer
    }
    // #endregion

    // #region build2d
    /** s[i][j] = sum of the rectangle (1,1)..(i,j). Row 0 and column 0 stay 0, so there are no edge cases. */
    static long[][] build2D(int[][] g) {
        int rows = g.length, cols = g[0].length;
        long[][] s = new long[rows + 1][cols + 1];
        for (int i = 1; i <= rows; i++) {
            for (int j = 1; j <= cols; j++) {
                s[i][j] = g[i - 1][j - 1] + s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1]; // @step fill
            }
        }
        return s;
    }
    // #endregion

    // #region query2d
    /** Sum of rows r1..r2 and columns c1..c2 (1-indexed, inclusive) = S(A) - S(B) - S(C) + S(D). */
    static long rect(long[][] s, int r1, int c1, int r2, int c2) {
        return s[r2][c2] - s[r1 - 1][c2] - s[r2][c1 - 1] + s[r1 - 1][c1 - 1]; // @step answer
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        // Book example: [1, 3, 4, 8, 6, 1, 4, 2] → prefix [1, 4, 8, 16, 22, 23, 27, 29], sumq(3, 6) = 19
        long[] p = build(new int[] {1, 3, 4, 8, 6, 1, 4, 2});
        check(p[7] == 29 && p[2] == 8, "book prefix array");
        check(sumq(p, 3, 6) == 19, "book sumq(3,6) = 19");

        Random rnd = new Random(91);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(20);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(2001) - 1000;
            long[] q = build(a);
            int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x);
            long exp = 0;
            for (int i = x; i <= y; i++) exp += a[i];
            check(sumq(q, x, y) == exp, "random 1D");

            int r = 1 + rnd.nextInt(7), c = 1 + rnd.nextInt(7);
            int[][] g = new int[r][c];
            for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) g[i][j] = rnd.nextInt(19) - 9;
            long[][] s = build2D(g);
            int r1 = 1 + rnd.nextInt(r), r2 = r1 + rnd.nextInt(r - r1 + 1);
            int c1 = 1 + rnd.nextInt(c), c2 = c1 + rnd.nextInt(c - c1 + 1);
            long e2 = 0;
            for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) e2 += g[i - 1][j - 1];
            check(rect(s, r1, c1, r2, c2) == e2, "random 2D");
        }
        System.out.println("PrefixSums OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
