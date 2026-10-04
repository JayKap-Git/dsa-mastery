package ch08;

import java.util.Arrays;
import java.util.Random;

/** §8.2 Nearest smaller elements with a stack. O(n): every position is pushed once and popped at most once. */
public class NearestSmaller {

    // #region stack
    /** answer[i] = the position of the nearest smaller element before i, or -1 if there is none. */
    static int[] nearestSmaller(int[] a) {
        int n = a.length;
        int[] answer = new int[n];
        int[] stack = new int[n]; // positions; their values increase from bottom to top
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && a[stack[top - 1]] >= a[i]) {
                top--; // @step pop
            }
            answer[i] = top == 0 ? -1 : stack[top - 1]; // @step answer
            stack[top++] = i; // @step push
        }
        return answer;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] book = {1, 3, 4, 2, 5, 3, 4, 2};
        check(Arrays.equals(nearestSmaller(book), new int[] {-1, 0, 1, 0, 3, 3, 5, 0}), "book example");
        Random rnd = new Random(82);
        for (int it = 0; it < 3000; it++) {
            int n = rnd.nextInt(15);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(10);
            int[] got = nearestSmaller(a);
            for (int i = 0; i < n; i++) {
                int want = -1;
                for (int j = i - 1; j >= 0; j--) if (a[j] < a[i]) { want = j; break; }
                check(got[i] == want, "matches the O(n²) scan");
            }
        }
        System.out.println("NearestSmaller OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
