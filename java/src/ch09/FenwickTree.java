package ch09;

import java.util.Random;

/** §9.2 Binary indexed (Fenwick) tree: prefix sums with point updates, both O(log n). 1-indexed. */
public class FenwickTree {

    // #region full
    // #region class
    final int n;
    final long[] tree; // tree[k] = sum of arr[k - p(k) + 1 .. k], where p(k) = k & -k

    FenwickTree(int n) {
        this.n = n;
        tree = new long[n + 1];
    }
    // #endregion

    // #region sum
    /** sumq(1, k) */
    long sum(int k) {
        long s = 0;
        while (k >= 1) { // @step loop
            s += tree[k]; // @step take
            k -= k & -k; // @step jump
        }
        return s; // @step done
    }
    // #endregion

    // #region add
    /** arr[k] += x  (x may be negative) */
    void add(int k, long x) {
        while (k <= n) { // @step loop
            tree[k] += x; // @step take
            k += k & -k; // @step jump
        }
    }
    // #endregion

    // #region range
    /** sumq(a, b) = sumq(1, b) - sumq(1, a - 1) */
    long sum(int a, int b) {
        return sum(b) - sum(a - 1);
    }
    // #endregion
    // #endregion

    // #region build
    /** O(n) construction from a 0-indexed array: each range passes its total up to the next range. */
    static FenwickTree of(int[] a) {
        FenwickTree f = new FenwickTree(a.length);
        for (int k = 1; k <= f.n; k++) {
            f.tree[k] += a[k - 1];
            int next = k + (k & -k);
            if (next <= f.n) f.tree[next] += f.tree[k];
        }
        return f;
    }
    // #endregion

    public static void main(String[] args) {
        // Book example: [1, 3, 4, 8, 6, 1, 4, 2] → tree [1, 4, 4, 16, 6, 7, 4, 29], sumq(1,7) = 16 + 7 + 4 = 27
        int[] book = {1, 3, 4, 8, 6, 1, 4, 2};
        FenwickTree f = of(book);
        long[] expectTree = {0, 1, 4, 4, 16, 6, 7, 4, 29};
        for (int k = 1; k <= 8; k++) check(f.tree[k] == expectTree[k], "book tree[" + k + "]");
        check(f.sum(7) == 27, "book sumq(1,7) = 27");

        Random rnd = new Random(93);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(30);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(201) - 100;
            FenwickTree byAdd = new FenwickTree(n);
            for (int i = 0; i < n; i++) byAdd.add(i + 1, a[i]);
            FenwickTree t = of(a);
            for (int k = 1; k <= n; k++) check(t.tree[k] == byAdd.tree[k], "O(n) build matches add()");
            for (int q = 0; q < 40; q++) {
                if (rnd.nextBoolean()) {
                    int k = rnd.nextInt(n), x = rnd.nextInt(41) - 20;
                    a[k] += x;
                    t.add(k + 1, x);
                } else {
                    int x = 1 + rnd.nextInt(n), y = x + rnd.nextInt(n - x + 1);
                    long exp = 0;
                    for (int i = x; i <= y; i++) exp += a[i - 1];
                    check(t.sum(x, y) == exp, "random range sum");
                }
            }
        }
        System.out.println("FenwickTree OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
