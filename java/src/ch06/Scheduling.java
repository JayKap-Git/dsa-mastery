package ch06;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Random;

/** §6.2 Scheduling: the most non-overlapping events. Events are {start, end}; an event may start when the last one ends. */
public class Scheduling {

    // #region earliestEnd
    static int maxEvents(int[][] events) {
        int[][] e = events.clone();
        Arrays.sort(e, Comparator.comparingInt(ev -> ev[1])); // by ending time
        int count = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] ev : e) { // @step consider
            if (ev[0] >= lastEnd) { // @step take
                count++;
                lastEnd = ev[1];
            }
        }
        return count; // @step done
    }
    // #endregion

    /** The two tempting strategies that fail: pick the next compatible event by `key`. */
    static int pickBy(int[][] events, Comparator<int[]> key) {
        int[][] e = events.clone();
        Arrays.sort(e, key);
        boolean[] taken = new boolean[e.length];
        int count = 0;
        for (int i = 0; i < e.length; i++) {
            boolean ok = true;
            for (int j = 0; j < e.length; j++)
                if (taken[j] && e[i][0] < e[j][1] && e[j][0] < e[i][1]) ok = false;
            if (ok) { taken[i] = true; count++; }
        }
        return count;
    }

    static int brute(int[][] e) {
        int best = 0;
        for (int mask = 0; mask < 1 << e.length; mask++) {
            boolean ok = true;
            for (int i = 0; i < e.length && ok; i++)
                for (int j = i + 1; j < e.length && ok; j++)
                    if ((mask >> i & 1) == 1 && (mask >> j & 1) == 1 && e[i][0] < e[j][1] && e[j][0] < e[i][1]) ok = false;
            if (ok) best = Math.max(best, Integer.bitCount(mask));
        }
        return best;
    }

    public static void main(String[] args) { // @selftest
        int[][] book = {{1, 3}, {2, 5}, {3, 9}, {6, 8}};
        check(maxEvents(book) == 2, "book example: 2 events");
        Comparator<int[]> shortest = Comparator.comparingInt(ev -> ev[1] - ev[0]);
        Comparator<int[]> earliestStart = Comparator.comparingInt(ev -> ev[0]);
        int[][] shortFails = {{1, 5}, {4, 7}, {6, 10}}; // the short middle one blocks both long ones
        check(pickBy(shortFails, shortest) == 1 && maxEvents(shortFails) == 2, "shortest-first fails");
        int[][] earlyFails = {{1, 10}, {2, 4}, {5, 7}};
        check(pickBy(earlyFails, earliestStart) == 1 && maxEvents(earlyFails) == 2, "earliest-start fails");
        Random rnd = new Random(6);
        for (int it = 0; it < 2000; it++) {
            int n = 1 + rnd.nextInt(10);
            int[][] e = new int[n][];
            for (int i = 0; i < n; i++) {
                int s = rnd.nextInt(20);
                e[i] = new int[] {s, s + 1 + rnd.nextInt(8)};
            }
            check(maxEvents(e) == brute(e), "earliest-end is optimal");
        }
        System.out.println("Scheduling OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
