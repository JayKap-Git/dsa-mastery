package ch08;

import java.util.Arrays;
import java.util.Random;

/** §8.1 Two pointers: a subarray with sum x, then 2SUM and 3SUM on a sorted array. */
public class TwoPointers {

    // #region subarray
    /** Positive numbers, x ≥ 1. Returns {from, to} (inclusive) of a subarray with sum x, or null. O(n). */
    static int[] subarraySum(int[] a, long x) {
        int n = a.length, right = 0; // the window is a[left..right-1]
        long sum = 0;
        for (int left = 0; left < n; left++) {
            while (right < n && sum + a[right] <= x) {
                sum += a[right++]; // @step grow
            }
            if (sum == x) return new int[] {left, right - 1}; // @step found
            // An empty window means a[left] alone is bigger than x: step past it.
            if (right == left) right++; // @step skip
            else sum -= a[left]; // @step shrink
        }
        return null;
    }
    // #endregion

    // #region twoSum
    /** a is sorted. Returns positions {i, j}, i < j, with a[i] + a[j] = x, or null. O(n) after sorting. */
    static int[] twoSum(int[] a, long x) {
        int right = a.length - 1;
        for (int left = 0; left < right; left++) {
            while (left < right && (long) a[left] + a[right] > x) {
                right--; // @step down
            }
            if (left == right) break;
            long s = (long) a[left] + a[right]; // @step check
            if (s == x) return new int[] {left, right}; // @step found
        }
        return null;
    }
    // #endregion

    // #region threeSum
    /** 3SUM in O(n²): fix the first value a[i], then run 2SUM on the part to its right. a is sorted. */
    static int[] threeSum(int[] a, long x) {
        for (int i = 0; i < a.length; i++) {
            int left = i + 1, right = a.length - 1;
            while (left < right) {
                long s = (long) a[i] + a[left] + a[right];
                if (s == x) return new int[] {i, left, right};
                if (s < x) left++;
                else right--;
            }
        }
        return null;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        check(Arrays.equals(subarraySum(new int[] {1, 3, 2, 5, 1, 1, 2, 3}, 8), new int[] {2, 4}), "book subarray 2+5+1");
        check(Arrays.equals(twoSum(new int[] {1, 4, 5, 6, 7, 9, 9, 10}, 12), new int[] {2, 4}), "book 2SUM 5+7");
        Random rnd = new Random(81);
        for (int it = 0; it < 3000; it++) {
            int n = rnd.nextInt(12);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = 1 + rnd.nextInt(8);
            long x = 1 + rnd.nextInt(30);

            int[] w = subarraySum(a, x);
            check((w != null) == bruteSubarray(a, x), "subarray exists");
            if (w != null) check(Arrays.stream(a, w[0], w[1] + 1).sum() == x, "subarray sum");

            int[] s = a.clone();
            Arrays.sort(s);
            int[] p = twoSum(s, x);
            check((p != null) == bruteK(s, x, 2), "2SUM exists");
            if (p != null) check(p[0] < p[1] && s[p[0]] + s[p[1]] == x, "2SUM pair");
            int[] t = threeSum(s, x);
            check((t != null) == bruteK(s, x, 3), "3SUM exists");
            if (t != null) check(t[0] < t[1] && t[1] < t[2] && s[t[0]] + s[t[1]] + s[t[2]] == x, "3SUM triple");
        }
        System.out.println("TwoPointers OK");
    }

    static boolean bruteSubarray(int[] a, long x) {
        for (int i = 0; i < a.length; i++) {
            long sum = 0;
            for (int j = i; j < a.length; j++) if ((sum += a[j]) == x) return true;
        }
        return false;
    }

    /** Is there a choice of exactly k positions whose values sum to x? */
    static boolean bruteK(int[] a, long x, int k) {
        for (int m = 0; m < (1 << a.length); m++) {
            if (Integer.bitCount(m) != k) continue;
            long sum = 0;
            for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) sum += a[i];
            if (sum == x) return true;
        }
        return false;
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
