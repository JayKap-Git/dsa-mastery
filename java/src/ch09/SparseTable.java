package ch09;

import java.util.Random;

/** §9.1 Static minimum queries: O(n log n) preprocessing, O(1) per query. */
public class SparseTable {

    // #region build
    final int[][] mn; // mn[j][i] = min of arr[i .. i + 2^j - 1]

    SparseTable(int[] arr) {
        int n = arr.length;
        int levels = 32 - Integer.numberOfLeadingZeros(n); // lengths 1, 2, 4, ... up to n
        mn = new int[levels][];
        mn[0] = arr.clone(); // @step base
        for (int j = 1; j < levels; j++) {
            int w = 1 << (j - 1); // half of the block length 2^j
            mn[j] = new int[n - (1 << j) + 1];
            for (int i = 0; i < mn[j].length; i++) {
                mn[j][i] = Math.min(mn[j - 1][i], mn[j - 1][i + w]); // @step combine
            }
        }
    }
    // #endregion

    // #region query
    /** minq(a, b): two blocks of length 2^j (possibly overlapping) cover [a, b] exactly. */
    int min(int a, int b) {
        int j = 31 - Integer.numberOfLeadingZeros(b - a + 1); // @step pick
        return Math.min(mn[j][a], mn[j][b - (1 << j) + 1]); // @step answer
    }
    // #endregion

    public static void main(String[] args) {
        // Book example: [1, 3, 4, 8, 6, 1, 4, 2], minq(1, 6) = min(minq(1,4), minq(3,6)) = min(3, 1) = 1
        SparseTable st = new SparseTable(new int[] {1, 3, 4, 8, 6, 1, 4, 2});
        check(st.min(1, 4) == 3 && st.min(3, 6) == 1 && st.min(1, 6) == 1, "book minq");

        Random rnd = new Random(92);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(40);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(201) - 100;
            SparseTable t = new SparseTable(a);
            for (int q = 0; q < 30; q++) {
                int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x);
                int exp = Integer.MAX_VALUE;
                for (int i = x; i <= y; i++) exp = Math.min(exp, a[i]);
                check(t.min(x, y) == exp, "random minq");
            }
        }
        System.out.println("SparseTable OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
