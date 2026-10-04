package ch05;

import java.util.Arrays;
import java.util.Random;

/** §5.5 Meet in the middle: can some numbers of the list add up to x? O(2^(n/2)) instead of O(2^n). */
public class MeetInTheMiddle {

    // #region sums
    /** All subset sums of a[from..to), sorted. */
    static long[] subsetSums(long[] a, int from, int to) {
        int m = to - from;
        long[] s = new long[1 << m];
        for (int b = 0; b < (1 << m); b++) {
            for (int i = 0; i < m; i++) if ((b & (1 << i)) != 0) s[b] += a[from + i];
        }
        Arrays.sort(s);
        return s;
    }
    // #endregion

    // #region mitm
    static boolean canMake(long[] a, long x) {
        int half = a.length / 2;
        long[] sa = subsetSums(a, 0, half); // @step left
        long[] sb = subsetSums(a, half, a.length); // @step right
        int i = 0, j = sb.length - 1; // smallest of SA with the largest of SB
        while (i < sa.length && j >= 0) { // @step pair
            long s = sa[i] + sb[j];
            if (s == x) return true; // @step found
            if (s < x) i++; // @step up
            else j--; // @step down
        }
        return false; // @step none
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        long[] book = {2, 4, 5, 9};
        check(Arrays.equals(subsetSums(book, 0, 2), new long[] {0, 2, 4, 6}), "book SA");
        check(Arrays.equals(subsetSums(book, 2, 4), new long[] {0, 5, 9, 14}), "book SB");
        check(canMake(book, 15) && !canMake(book, 10), "book: 15 yes, 10 no");
        Random rnd = new Random(55);
        for (int it = 0; it < 500; it++) {
            int n = 1 + rnd.nextInt(14);
            long[] a = new long[n];
            for (int i = 0; i < n; i++) a[i] = 1 + rnd.nextInt(50);
            long x = rnd.nextInt(200);
            boolean brute = false;
            for (int b = 0; b < (1 << n) && !brute; b++) {
                long s = 0;
                for (int i = 0; i < n; i++) if ((b & (1 << i)) != 0) s += a[i];
                brute = s == x;
            }
            check(canMake(a, x) == brute, "agrees with all 2^n subsets");
        }
        System.out.println("MeetInTheMiddle OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
