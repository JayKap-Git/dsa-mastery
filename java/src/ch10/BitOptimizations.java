package ch10;

import java.util.Random;

/** §10.4 Same complexity, a much smaller constant: let one machine word do 32 or 64 comparisons at once. */
public class BitOptimizations {

    // #region hamming
    /** Bit strings of length ≤ 32 stored as ints: they differ exactly at the one bits of a ^ b. */
    static int hamming(int a, int b) {
        return Integer.bitCount(a ^ b);
    }

    static int minHamming(int[] s) {
        int best = Integer.MAX_VALUE;
        for (int i = 0; i < s.length; i++) {
            for (int j = i + 1; j < s.length; j++) {
                best = Math.min(best, hamming(s[i], s[j])); // @step pair
            }
        }
        return best;
    }
    // #endregion

    // #region subgrids
    /** Rows packed 64 columns per long. Counts the subgrids whose four corners are black: O(n³/64). */
    static long blackCornerSubgrids(long[][] row) {
        int n = row.length, words = row[0].length;
        long total = 0;
        for (int a = 0; a < n; a++) {
            for (int b = a + 1; b < n; b++) {
                long both = 0; // columns that are black in rows a and b
                for (int w = 0; w < words; w++) both += Long.bitCount(row[a][w] & row[b][w]);
                total += both * (both - 1) / 2; // any two of them are the corners of a subgrid
            }
        }
        return total;
    }

    static long[][] pack(boolean[][] black) {
        int n = black.length, words = (n + 63) / 64;
        long[][] row = new long[n][words];
        for (int y = 0; y < n; y++) {
            for (int x = 0; x < n; x++) if (black[y][x]) row[y][x / 64] |= 1L << (x % 64);
        }
        return row;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] book = {Integer.parseInt("00111", 2), Integer.parseInt("01101", 2), Integer.parseInt("11110", 2)};
        check(hamming(book[0], book[1]) == 2 && hamming(book[0], book[2]) == 3 && hamming(book[1], book[2]) == 3, "book distances");
        check(minHamming(book) == 2, "book minimum 2");

        Random rnd = new Random(104);
        for (int it = 0; it < 300; it++) {
            int n = 1 + rnd.nextInt(140); // crosses the 64-column word boundary
            boolean[][] g = new boolean[n][n];
            for (boolean[] r : g) for (int x = 0; x < n; x++) r[x] = rnd.nextInt(3) > 0;
            long slow = 0;
            for (int a = 0; a < n; a++) {
                for (int b = a + 1; b < n; b++) {
                    long both = 0;
                    for (int x = 0; x < n; x++) if (g[a][x] && g[b][x]) both++;
                    slow += both * (both - 1) / 2;
                }
            }
            check(blackCornerSubgrids(pack(g)) == slow, "packed = column by column");
            int s = rnd.nextInt(), t = rnd.nextInt();
            int d = 0;
            for (int i = 0; i < 32; i++) if ((s >> i & 1) != (t >> i & 1)) d++;
            check(hamming(s, t) == d, "hamming = differing positions");
        }
        System.out.println("BitOptimizations OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
