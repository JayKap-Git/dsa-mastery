package ch03;

import java.util.Arrays;
import java.util.Random;
import java.util.function.IntPredicate;

/** §3.3 Binary search: two classic methods, lower/upper bound, and searching on an answer. */
public class BinarySearch {

    // #region method1
    /** Index of x in sorted a, or -1. Keeps an active region [lo, hi] and halves it. */
    static int find(int[] a, int x) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) { // @step loop
            int k = (lo + hi) >>> 1; // @step mid
            if (a[k] == x) return k; // @step found
            if (a[k] > x) hi = k - 1; // @step left
            else lo = k + 1; // @step right
        }
        return -1; // @step missing
    }
    // #endregion

    // #region method2
    /** Jump forward with lengths n/2, n/4, ..., 1, never past x. */
    static int findByJumps(int[] a, int x) {
        int n = a.length, k = 0;
        if (n == 0) return -1;
        for (int b = n / 2; b >= 1; b /= 2) { // @step jump
            while (k + b < n && a[k + b] <= x) k += b; // @step move
        }
        return a[k] == x ? k : -1; // @step check
    }
    // #endregion

    // #region bounds
    /** First index with a[i] >= x (C++ lower_bound); a.length if none. */
    static int lowerBound(int[] a, int x) {
        int lo = 0, hi = a.length; // answer lies in [lo, hi]
        while (lo < hi) { // @step loop
            int mid = (lo + hi) >>> 1; // @step mid
            if (a[mid] >= x) hi = mid; // @step left
            else lo = mid + 1; // @step right
        }
        return lo; // @step done
    }

    /** First index with a[i] > x (C++ upper_bound). */
    static int upperBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] > x) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
    // #endregion

    // #region smallest
    /** Smallest k in [0, z] with ok(k) true, when ok is false…false true…true and ok(z) is true. */
    static int smallestTrue(IntPredicate ok, int z) {
        int x = -1;
        for (int b = z; b >= 1; b /= 2) {
            while (x + b <= z && !ok.test(x + b)) x += b;
        }
        return x + 1;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] a = {1, 2, 2, 2, 5, 7, 9};
        check(lowerBound(a, 2) == 1 && upperBound(a, 2) == 4, "bounds around a run of 2s");
        check(upperBound(a, 2) - lowerBound(a, 2) == 3, "count of 2s (equal_range)");
        check(lowerBound(a, 6) == 5 && lowerBound(a, 10) == a.length && lowerBound(a, 0) == 0, "insert positions");
        // Arrays.binarySearch: index of SOME match, or -(insertion point) - 1 when missing.
        check(Arrays.binarySearch(a, 6) == -(5) - 1, "Arrays.binarySearch miss encoding");

        Random rnd = new Random(4);
        for (int it = 0; it < 3000; it++) {
            int n = rnd.nextInt(25);
            int[] s = new int[n];
            for (int i = 0; i < n; i++) s[i] = rnd.nextInt(15);
            Arrays.sort(s);
            int x = rnd.nextInt(17) - 1;
            boolean present = Arrays.stream(s).anyMatch(v -> v == x);
            int i1 = find(s, x), i2 = findByJumps(s, x);
            check(present ? (i1 >= 0 && s[i1] == x) : i1 == -1, "method 1");
            check(present ? (i2 >= 0 && s[i2] == x) : i2 == -1, "method 2");
            int lb = 0;
            while (lb < n && s[lb] < x) lb++;
            int ub = lb;
            while (ub < n && s[ub] == x) ub++;
            check(lowerBound(s, x) == lb && upperBound(s, x) == ub, "bounds");
        }
        for (int k = 0; k <= 1000; k += 7) {
            final int kk = k;
            check(smallestTrue(v -> v >= kk, 1024) == k, "smallest solution");
        }
        System.out.println("BinarySearch OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
