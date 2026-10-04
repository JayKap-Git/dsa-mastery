package ch05;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** §5.1–5.2 Generating all subsets and all permutations of {0, 1, ..., n-1}. */
public class Generate {
    static int n;
    static List<List<Integer>> out = new ArrayList<>();

    // #region subsets
    static List<Integer> subset = new ArrayList<>();

    /** Decide element k: leave it out, then take it. */
    static void search(int k) {
        if (k == n) { // @step leaf
            out.add(new ArrayList<>(subset)); // process subset
        } else {
            search(k + 1); // @step skip
            subset.add(k); // @step take
            search(k + 1); // @step take
            subset.remove(subset.size() - 1); // @step undo
        }
    }
    // #endregion

    // #region bitmask
    /** Subsets as the bits of b = 0 .. 2^n - 1: bit i set ⇔ element i is in the subset. */
    static List<List<Integer>> subsetsByBits(int n) {
        List<List<Integer>> all = new ArrayList<>();
        for (int b = 0; b < (1 << n); b++) { // @step mask
            List<Integer> s = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((b & (1 << i)) != 0) s.add(i); // @step bit
            }
            all.add(s);
        }
        return all;
    }
    // #endregion

    // #region permutations
    static List<Integer> perm = new ArrayList<>();
    static boolean[] chosen;

    static void permute() {
        if (perm.size() == n) { // @step leaf
            out.add(new ArrayList<>(perm)); // process permutation
            return;
        }
        for (int i = 0; i < n; i++) { // @step try
            if (chosen[i]) continue;
            chosen[i] = true; // @step choose
            perm.add(i); // @step choose
            permute();
            chosen[i] = false; // @step undo
            perm.remove(perm.size() - 1); // @step undo
        }
    }
    // #endregion

    // #region next
    /** C++'s next_permutation, which Java lacks. Returns false after the last (descending) permutation. */
    static boolean nextPermutation(int[] a) {
        int i = a.length - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--; // longest non-increasing suffix
        if (i < 0) return false;
        int j = a.length - 1;
        while (a[j] <= a[i]) j--; // rightmost element bigger than a[i]
        int t = a[i]; a[i] = a[j]; a[j] = t;
        for (int l = i + 1, r = a.length - 1; l < r; l++, r--) { t = a[l]; a[l] = a[r]; a[r] = t; }
        return true;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        for (int size = 0; size <= 8; size++) {
            n = size;
            out.clear();
            subset.clear();
            search(0);
            check(out.size() == 1 << n, "2^n subsets");
            Set<List<Integer>> rec = new HashSet<>(out), bits = new HashSet<>(subsetsByBits(n));
            check(rec.size() == 1 << n && rec.equals(bits), "both methods give the same distinct subsets");

            out.clear();
            perm.clear();
            chosen = new boolean[n];
            permute();
            int fact = 1;
            for (int i = 2; i <= n; i++) fact *= i;
            check(out.size() == fact && new HashSet<>(out).size() == fact, "n! distinct permutations");

            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = i;
            int idx = 0;
            do {
                int[] want = out.get(idx++).stream().mapToInt(Integer::intValue).toArray();
                check(Arrays.equals(a, want), "nextPermutation walks lexicographic order");
            } while (nextPermutation(a));
            check(idx == fact, "nextPermutation visits all");
        }
        // Book: 25 = 11001₂ ↔ {0, 3, 4}
        check(subsetsByBits(5).get(25).equals(List.of(0, 3, 4)), "bitmask 25");
        System.out.println("Generate OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
