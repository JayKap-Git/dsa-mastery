package ch10;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;

/** §10.3 Subsets of {0..31} stored in one int: one bit per element. */
public class BitSets {

    // #region set
    static int of(int... elements) {
        int x = 0;
        for (int e : elements) x |= 1 << e;
        return x;
    }

    static List<Integer> elements(int x) {
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < 32; i++) {
            if ((x & (1 << i)) != 0) out.add(i);
        }
        return out;
    }

    static int size(int x) { return Integer.bitCount(x); }
    // #endregion

    // #region ops
    static int intersection(int a, int b) { return a & b; }
    static int union(int a, int b)        { return a | b; }
    static int difference(int a, int b)   { return a & ~b; }
    /** ~a flips all 32 bits, so keep only the elements 0..n-1 of the universe. */
    static int complement(int a, int n)   { return ~a & ((1 << n) - 1); }
    // #endregion

    // #region subsets
    /** All subsets of {0..n-1} with exactly k elements. Drop the if to get all 2^n subsets. */
    static List<Integer> subsetsOfSize(int n, int k) {
        List<Integer> out = new ArrayList<>();
        for (int b = 0; b < (1 << n); b++) {
            if (Integer.bitCount(b) == k) out.add(b);
        }
        return out;
    }
    // #endregion

    // #region submasks
    /** Every subset b of the set x, from the empty set upwards. */
    static List<Integer> subsetsOf(int x) {
        List<Integer> out = new ArrayList<>();
        int b = 0;
        do {
            out.add(b); // @step visit
            b = (b - x) & x; // @step next
        } while (b != 0);
        return out;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int x = of(1, 3, 4, 8), y = of(3, 6, 8, 9);
        check(x == 282 && size(x) == 4 && elements(x).equals(List.of(1, 3, 4, 8)), "book set {1,3,4,8} = 282");
        check(elements(union(x, y)).equals(List.of(1, 3, 4, 6, 8, 9)) && size(union(x, y)) == 6, "book union");
        check(elements(intersection(x, y)).equals(List.of(3, 8)), "intersection");
        check(elements(difference(x, y)).equals(List.of(1, 4)), "difference");
        check(elements(complement(x, 10)).equals(List.of(0, 2, 5, 6, 7, 9)), "complement in {0..9}");
        check(subsetsOfSize(5, 2).size() == 10 && subsetsOfSize(5, 0).size() == 1, "C(5,2) = 10");

        Random rnd = new Random(103);
        for (int it = 0; it < 2000; it++) {
            int s = rnd.nextInt(1 << 12);
            List<Integer> subs = subsetsOf(s);
            check(subs.size() == 1 << Integer.bitCount(s), "2^|s| subsets");
            check(new HashSet<>(subs).size() == subs.size(), "no repeats");
            for (int i = 0; i < subs.size(); i++) {
                check((subs.get(i) & ~s) == 0, "only elements of s");
                if (i > 0) check(subs.get(i) > subs.get(i - 1), "increasing order");
            }
        }
        System.out.println("BitSets OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
