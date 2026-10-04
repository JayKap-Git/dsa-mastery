package ch04;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;

/** §4.6 Comparison to sorting: how many values appear in both A and B (values distinct within a list). */
public class CommonElements {

    // #region treeset
    static int withTreeSet(int[] a, int[] b) { // O(n log n), big constant: a balanced tree
        Set<Integer> s = new TreeSet<>();
        for (int x : a) s.add(x);
        int count = 0;
        for (int x : b) if (s.contains(x)) count++;
        return count;
    }
    // #endregion

    // #region hashset
    static int withHashSet(int[] a, int[] b) { // O(n) on average
        Set<Integer> s = new HashSet<>();
        for (int x : a) s.add(x);
        int count = 0;
        for (int x : b) if (s.contains(x)) count++;
        return count;
    }
    // #endregion

    // #region sorting
    static int withSorting(int[] a, int[] b) { // O(n log n), tiny constant: sort once, then walk
        int[] x = a.clone(), y = b.clone();
        Arrays.sort(x);
        Arrays.sort(y);
        int i = 0, j = 0, count = 0;
        while (i < x.length && j < y.length) {
            if (x[i] == y[j]) { count++; i++; j++; }
            else if (x[i] < y[j]) i++;
            else j++;
        }
        return count;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] a = {5, 2, 8, 9, 4}, b = {3, 2, 9, 5};
        check(withTreeSet(a, b) == 3 && withHashSet(a, b) == 3 && withSorting(a, b) == 3, "book example = 3");
        Random rnd = new Random(5);
        for (int it = 0; it < 500; it++) {
            int[] p = rnd.ints(0, 60).distinct().limit(rnd.nextInt(30)).toArray();
            int[] q = rnd.ints(0, 60).distinct().limit(rnd.nextInt(30)).toArray();
            int t = withTreeSet(p, q);
            check(withHashSet(p, q) == t && withSorting(p, q) == t, "agree");
        }
        System.out.println("CommonElements OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
