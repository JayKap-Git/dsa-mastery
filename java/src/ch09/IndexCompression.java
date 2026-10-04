package ch09;

import java.util.Arrays;
import java.util.Random;

/** §9.4 Index compression: map large or sparse values to 1, 2, 3, ... keeping their order. */
public class IndexCompression {

    // #region compress
    /** c(x) = rank of x among the distinct values, starting from 1 like the book. */
    static int[] compress(int[] xs) {
        int[] sorted = Arrays.stream(xs).distinct().sorted().toArray(); // @step sort
        int[] c = new int[xs.length];
        for (int i = 0; i < xs.length; i++) {
            c[i] = Arrays.binarySearch(sorted, xs[i]) + 1; // @step map
        }
        return c;
    }
    // #endregion

    public static void main(String[] args) {
        // Book example: indices 555, 10^9 and 8 become c(8) = 1, c(555) = 2, c(10^9) = 3
        int[] c = compress(new int[] {555, 1_000_000_000, 8});
        check(Arrays.equals(c, new int[] {2, 3, 1}), "book example");

        Random rnd = new Random(96);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(20);
            int[] xs = new int[n];
            for (int i = 0; i < n; i++) xs[i] = rnd.nextInt(50) * 1000;
            int[] r = compress(xs);
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    check(Integer.compare(xs[i], xs[j]) == Integer.compare(r[i], r[j]), "order preserved");
            int distinct = (int) Arrays.stream(xs).distinct().count();
            check(Arrays.stream(r).max().getAsInt() == distinct && Arrays.stream(r).min().getAsInt() == 1, "ranks are 1..k");
        }
        System.out.println("IndexCompression OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
