package ch07;

import java.util.Random;

/** §7.5 Edit distance (Levenshtein): the fewest inserts, removes and modifications that turn x into y. */
public class EditDistance {

    // #region distance
    /** d[a][b] = edit distance between the first a characters of x and the first b of y. */
    static int[][] table(String x, String y) {
        int n = x.length(), m = y.length();
        int[][] d = new int[n + 1][m + 1];
        for (int a = 0; a <= n; a++) d[a][0] = a; // remove everything
        for (int b = 0; b <= m; b++) d[0][b] = b; // insert everything
        for (int a = 1; a <= n; a++) {
            for (int b = 1; b <= m; b++) {
                int cost = x.charAt(a - 1) == y.charAt(b - 1) ? 0 : 1;
                d[a][b] = Math.min(Math.min(d[a][b - 1] + 1, d[a - 1][b] + 1), d[a - 1][b - 1] + cost); // @step cell
            }
        }
        return d;
    }
    // #endregion

    static int naive(String x, String y) {
        if (x.isEmpty()) return y.length();
        if (y.isEmpty()) return x.length();
        int cost = x.charAt(x.length() - 1) == y.charAt(y.length() - 1) ? 0 : 1;
        String xs = x.substring(0, x.length() - 1), ys = y.substring(0, y.length() - 1);
        return Math.min(Math.min(naive(x, ys) + 1, naive(xs, y) + 1), naive(xs, ys) + cost);
    }

    public static void main(String[] args) { // @selftest
        int[][] d = table("LOVE", "MOVIE");
        check(d[4][5] == 2, "book: LOVE → MOVIE = 2");
        int[][] bookRows = {{0, 1, 2, 3, 4, 5}, {1, 1, 2, 3, 4, 5}, {2, 2, 1, 2, 3, 4}, {3, 3, 2, 1, 2, 3}, {4, 4, 3, 2, 2, 2}};
        for (int a = 0; a <= 4; a++) for (int b = 0; b <= 5; b++) check(d[a][b] == bookRows[a][b], "book table");
        Random rnd = new Random(75);
        for (int it = 0; it < 500; it++) {
            String x = rand(rnd), y = rand(rnd);
            check(table(x, y)[x.length()][y.length()] == naive(x, y), "matches the recursion");
        }
        System.out.println("EditDistance OK");
    }

    static String rand(Random rnd) {
        StringBuilder sb = new StringBuilder();
        for (int i = rnd.nextInt(6); i > 0; i--) sb.append((char) ('a' + rnd.nextInt(3)));
        return sb.toString();
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
