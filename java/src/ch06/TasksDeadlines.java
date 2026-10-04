package ch06;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Random;

/** §6.3 Tasks {duration, deadline}: finishing a task at time x earns deadline − x. Maximise the total. */
public class TasksDeadlines {

    // #region score
    /** Do the tasks shortest-first. The deadlines don't affect the order at all. */
    static long bestScore(int[][] tasks) {
        int[][] t = tasks.clone();
        Arrays.sort(t, Comparator.comparingInt(task -> task[0])); // by duration
        long time = 0, score = 0;
        for (int[] task : t) { // @step run
            time += task[0]; // @step run
            score += task[1] - time; // @step score
        }
        return score;
    }
    // #endregion

    static long scoreInOrder(int[][] t, int[] order) {
        long time = 0, score = 0;
        for (int i : order) { time += t[i][0]; score += t[i][1] - time; }
        return score;
    }

    static long brute(int[][] t) {
        int n = t.length;
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        long best = Long.MIN_VALUE;
        do best = Math.max(best, scoreInOrder(t, p)); while (nextPermutation(p));
        return best;
    }

    static boolean nextPermutation(int[] a) {
        int i = a.length - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i < 0) return false;
        int j = a.length - 1;
        while (a[j] <= a[i]) j--;
        int x = a[i]; a[i] = a[j]; a[j] = x;
        for (int l = i + 1, r = a.length - 1; l < r; l++, r--) { x = a[l]; a[l] = a[r]; a[r] = x; }
        return true;
    }

    public static void main(String[] args) { // @selftest
        int[][] book = {{4, 2}, {3, 5}, {2, 7}, {4, 5}}; // A, B, C, D
        check(bestScore(book) == -10, "book: total -10");
        Random rnd = new Random(63);
        for (int it = 0; it < 500; it++) {
            int n = 1 + rnd.nextInt(7);
            int[][] t = new int[n][];
            for (int i = 0; i < n; i++) t[i] = new int[] {1 + rnd.nextInt(9), rnd.nextInt(30)};
            check(bestScore(t) == brute(t), "shortest-first is optimal");
        }
        System.out.println("TasksDeadlines OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
