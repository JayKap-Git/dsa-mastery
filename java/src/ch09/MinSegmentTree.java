package ch09;

import java.util.Random;

/** §9.3 "Other queries": the same bottom-up segment tree, combining with min instead of +. */
public class MinSegmentTree {

    // #region class
    final int n; // a power of two
    final long[] tree;

    MinSegmentTree(int[] arr) {
        n = arr.length;
        tree = new long[2 * n];
        for (int i = 0; i < n; i++) tree[n + i] = arr[i]; // @step leaves
        for (int k = n - 1; k >= 1; k--) {
            tree[k] = Math.min(tree[2 * k], tree[2 * k + 1]); // @step build
        }
    }
    // #endregion

    // #region min
    /** minq(a, b), 0-indexed and inclusive. Long.MAX_VALUE is the identity for min. */
    long min(int a, int b) {
        a += n; b += n; // @step shift
        long m = Long.MAX_VALUE;
        while (a <= b) { // @step loop
            if (a % 2 == 1) m = Math.min(m, tree[a++]); // @step takeA
            if (b % 2 == 0) m = Math.min(m, tree[b--]); // @step takeB
            a /= 2; b /= 2; // @step up
        }
        return m; // @step done
    }
    // #endregion

    // #region set
    /** arr[k] = x. For min queries "assign" is more natural than "add". */
    void set(int k, long x) {
        k += n; // @step leaf
        tree[k] = x; // @step leaf
        for (k /= 2; k >= 1; k /= 2) { // @step climb
            tree[k] = Math.min(tree[2 * k], tree[2 * k + 1]); // @step recompute
        }
    }
    // #endregion

    // #region argmin
    /** Position of a smallest element: walk down from the root into a child that holds the same minimum. */
    int argmin() {
        int k = 1; // @step root
        while (k < n) { // @step descend
            k = tree[2 * k] == tree[k] ? 2 * k : 2 * k + 1; // @step pick
        }
        return k - n; // @step done
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        // Book example: [5, 8, 6, 3, 1, 7, 2, 6] → root 1, and the minimum sits at index 4
        MinSegmentTree st = new MinSegmentTree(new int[] {5, 8, 6, 3, 1, 7, 2, 6});
        long[] expect = {0, 1, 3, 1, 5, 3, 1, 2, 5, 8, 6, 3, 1, 7, 2, 6};
        for (int k = 1; k < 16; k++) check(st.tree[k] == expect[k], "book tree[" + k + "]");
        check(st.argmin() == 4, "book argmin = 4");

        Random rnd = new Random(95);
        for (int it = 0; it < 300; it++) {
            int n = 1 << rnd.nextInt(6);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(201) - 100;
            MinSegmentTree t = new MinSegmentTree(a);
            for (int q = 0; q < 40; q++) {
                int op = rnd.nextInt(3);
                if (op == 0) {
                    int k = rnd.nextInt(n), x = rnd.nextInt(201) - 100;
                    a[k] = x;
                    t.set(k, x);
                } else if (op == 1) {
                    int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x);
                    long exp = Long.MAX_VALUE;
                    for (int i = x; i <= y; i++) exp = Math.min(exp, a[i]);
                    check(t.min(x, y) == exp, "random minq");
                } else {
                    int pos = t.argmin();
                    long best = Long.MAX_VALUE;
                    for (int v : a) best = Math.min(best, v);
                    check(a[pos] == best, "argmin points at a minimum");
                }
            }
        }
        System.out.println("MinSegmentTree OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
