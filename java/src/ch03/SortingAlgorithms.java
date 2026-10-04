package ch03;

import java.util.Arrays;
import java.util.Random;

/** §3.1 Sorting theory: bubble sort and inversions, merge sort, counting sort. */
public class SortingAlgorithms {

    // #region bubble
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - 1; j++) { // @step compare
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; // @step swap
                }
            }
        }
    }
    // #endregion

    // #region inversions
    /** Pairs (i, j) with i < j and a[i] > a[j]. Each adjacent swap removes exactly one. */
    static long inversions(int[] a) {
        long count = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++)
                if (a[i] > a[j]) count++;
        return count;
    }
    // #endregion

    // #region merge
    static void mergeSort(int[] a) {
        mergeSort(a, new int[a.length], 0, a.length - 1);
    }

    /** Sorts a[lo..hi]; tmp is scratch space so we allocate only once. */
    static void mergeSort(int[] a, int[] tmp, int lo, int hi) {
        if (lo >= hi) return; // @step base
        int mid = (lo + hi) >>> 1;
        mergeSort(a, tmp, lo, mid); // @step split
        mergeSort(a, tmp, mid + 1, hi); // @step split
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++]; // @step take
        while (i <= mid) tmp[k++] = a[i++]; // @step drainLeft
        while (j <= hi) tmp[k++] = a[j++]; // @step drainRight
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1); // @step copy
    }
    // #endregion

    // #region counting
    /** O(n + c) for values in 0..c: count, then write each value out count times. */
    static void countingSort(int[] a, int c) {
        int[] count = new int[c + 1];
        for (int x : a) count[x]++; // @step count
        int k = 0;
        for (int v = 0; v <= c; v++) {
            for (int t = 0; t < count[v]; t++) a[k++] = v; // @step write
        }
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        // Book: the first round of bubble sort on [1, 3, 8, 2, 9, 2, 5, 6] ends with 9 in place.
        int[] round = {1, 3, 8, 2, 9, 2, 5, 6};
        for (int j = 0; j < round.length - 1; j++)
            if (round[j] > round[j + 1]) { int t = round[j]; round[j] = round[j + 1]; round[j + 1] = t; }
        check(Arrays.equals(round, new int[] {1, 3, 2, 8, 2, 5, 6, 9}), "book: first bubble round");
        check(inversions(new int[] {1, 2, 2, 6, 3, 5, 9, 8}) == 3, "book: 3 inversions");
        check(inversions(new int[] {5, 4, 3, 2, 1}) == 10, "reverse order has n(n-1)/2");

        int[] book = {1, 3, 6, 2, 8, 2, 5, 9};
        mergeSort(book);
        check(Arrays.equals(book, new int[] {1, 2, 2, 3, 5, 6, 8, 9}), "book: merge sort");
        int[] cs = {1, 3, 6, 9, 9, 3, 5, 9};
        countingSort(cs, 9);
        check(Arrays.equals(cs, new int[] {1, 3, 3, 5, 6, 9, 9, 9}), "book: counting sort");

        Random rnd = new Random(3);
        for (int it = 0; it < 2000; it++) {
            int n = rnd.nextInt(40);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(20);
            int[] want = a.clone();
            Arrays.sort(want);
            int[] b1 = a.clone(), b2 = a.clone(), b3 = a.clone();
            bubbleSort(b1);
            mergeSort(b2);
            countingSort(b3, 19);
            check(Arrays.equals(b1, want) && Arrays.equals(b2, want) && Arrays.equals(b3, want), "sorts agree");
        }
        System.out.println("SortingAlgorithms OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
