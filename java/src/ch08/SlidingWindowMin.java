package ch08;

import java.util.Arrays;
import java.util.Random;

/** §8.3 Sliding window minimum with a monotonic deque. O(n): every position enters once and leaves at most once. */
public class SlidingWindowMin {

    // #region deque
    /** mins[i] = the smallest value in the window a[i..i+k-1]. */
    static int[] windowMins(int[] a, int k) {
        int n = a.length;
        int[] mins = new int[n - k + 1];
        int[] q = new int[n]; // positions; their values increase from head to tail
        int head = 0, tail = 0;
        for (int i = 0; i < n; i++) {
            while (tail > head && a[q[tail - 1]] >= a[i]) {
                tail--; // @step popBack
            }
            if (tail > head && q[head] <= i - k) {
                head++; // @step popFront
            }
            q[tail++] = i; // @step push
            if (i >= k - 1) {
                mins[i - k + 1] = a[q[head]]; // @step report
            }
        }
        return mins;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        check(Arrays.equals(windowMins(new int[] {2, 1, 4, 5, 3, 4, 1, 2}, 4), new int[] {1, 1, 3, 1, 1}), "book example");
        Random rnd = new Random(83);
        for (int it = 0; it < 3000; it++) {
            int n = 1 + rnd.nextInt(15);
            int k = 1 + rnd.nextInt(n);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(10);
            int[] got = windowMins(a, k);
            for (int i = 0; i + k <= n; i++) {
                check(got[i] == Arrays.stream(a, i, i + k).min().getAsInt(), "matches the O(nk) scan");
            }
        }
        System.out.println("SlidingWindowMin OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
