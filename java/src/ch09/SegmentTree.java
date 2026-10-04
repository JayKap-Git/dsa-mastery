package ch09;

import java.util.Random;

/** §9.3 Bottom-up segment tree for range sums. The number of leaves n must be a power of two. */
public class SegmentTree {

    // #region full
    // #region class
    final int n; // number of leaves (pad the array with zeros up to a power of two)
    final long[] tree; // tree[1] = root, children of k are 2k and 2k+1, leaves are tree[n .. 2n-1]

    SegmentTree(int[] arr) {
        n = arr.length;
        tree = new long[2 * n];
        for (int i = 0; i < n; i++) tree[n + i] = arr[i]; // @step leaves
        for (int k = n - 1; k >= 1; k--) {
            tree[k] = tree[2 * k] + tree[2 * k + 1]; // @step build
        }
    }
    // #endregion

    // #region sum
    /** sumq(a, b), 0-indexed and inclusive. */
    long sum(int a, int b) {
        a += n; b += n; // @step shift
        long s = 0;
        while (a <= b) { // @step loop
            if (a % 2 == 1) s += tree[a++]; // @step takeA
            if (b % 2 == 0) s += tree[b--]; // @step takeB
            a /= 2; b /= 2; // @step up
        }
        return s; // @step done
    }
    // #endregion

    // #region add
    /** arr[k] += x, then fix every ancestor of the leaf. */
    void add(int k, long x) {
        k += n; // @step leaf
        tree[k] += x; // @step leaf
        for (k /= 2; k >= 1; k /= 2) { // @step climb
            tree[k] = tree[2 * k] + tree[2 * k + 1]; // @step recompute
        }
    }
    // #endregion
    // #endregion

    public static void main(String[] args) { // @selftest
        // Book example: [5, 8, 6, 3, 2, 7, 2, 6] → root 39, sumq(2, 7) = 9 + 17 = 26
        SegmentTree st = new SegmentTree(new int[] {5, 8, 6, 3, 2, 7, 2, 6});
        long[] expect = {0, 39, 22, 17, 13, 9, 9, 8, 5, 8, 6, 3, 2, 7, 2, 6};
        for (int k = 1; k < 16; k++) check(st.tree[k] == expect[k], "book tree[" + k + "]");
        check(st.sum(2, 7) == 26, "book sumq(2,7) = 26");

        Random rnd = new Random(94);
        for (int it = 0; it < 300; it++) {
            int n = 1 << rnd.nextInt(6);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(201) - 100;
            SegmentTree t = new SegmentTree(a);
            for (int q = 0; q < 40; q++) {
                if (rnd.nextBoolean()) {
                    int k = rnd.nextInt(n), x = rnd.nextInt(41) - 20;
                    a[k] += x;
                    t.add(k, x);
                } else {
                    int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x);
                    long exp = 0;
                    for (int i = x; i <= y; i++) exp += a[i];
                    check(t.sum(x, y) == exp, "random sumq");
                }
            }
        }
        // Pro tip from the lesson: for commutative operations the same loops work for ANY n, not just powers of two.
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(40);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(201) - 100;
            SegmentTree t = new SegmentTree(a);
            int x = rnd.nextInt(n), y = x + rnd.nextInt(n - x);
            long exp = 0;
            for (int i = x; i <= y; i++) exp += a[i];
            check(t.sum(x, y) == exp, "any-n sumq");
        }
        System.out.println("SegmentTree OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
