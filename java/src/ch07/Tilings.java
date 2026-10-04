package ch07;

/** §7.6 Counting domino tilings of an n×m grid, row by row, with the compact 2^m row states. */
public class Tilings {

    // #region dp
    static int n, m;
    static long[][] count; // count[row][mask]: ways where `mask` marks the columns of row `row` already covered from above

    static long tilings(int rows, int cols) {
        n = rows;
        m = cols;
        count = new long[n + 1][1 << m];
        count[0][0] = 1;
        for (int row = 0; row < n; row++) {
            for (int mask = 0; mask < 1 << m; mask++) {
                if (count[row][mask] != 0) fill(row, mask, 0, 0); // @step row
            }
        }
        return count[n][0]; // @step done
    }

    /** Cover row `row` from column `col`; `next` collects vertical tiles sticking down into the next row. */
    static void fill(int row, int mask, int col, int next) {
        if (col == m) {
            count[row + 1][next] += count[row][mask]; // @step add
            return;
        }
        if ((mask >> col & 1) == 1) { // covered by a tile from above
            fill(row, mask, col + 1, next);
            return;
        }
        fill(row, mask, col + 1, next | 1 << col); // vertical tile down
        if (col + 1 < m && (mask >> (col + 1) & 1) == 0) fill(row, mask, col + 2, next); // horizontal tile
    }
    // #endregion

    static long brute(boolean[][] g, int cell) {
        if (cell == n * m) return 1;
        int r = cell / m, c = cell % m;
        if (g[r][c]) return brute(g, cell + 1);
        long ways = 0;
        g[r][c] = true;
        if (c + 1 < m && !g[r][c + 1]) { g[r][c + 1] = true; ways += brute(g, cell + 1); g[r][c + 1] = false; }
        if (r + 1 < n && !g[r + 1][c]) { g[r + 1][c] = true; ways += brute(g, cell + 1); g[r + 1][c] = false; }
        g[r][c] = false;
        return ways;
    }

    public static void main(String[] args) { // @selftest
        check(tilings(4, 7) == 781, "book: 4×7 has 781 tilings");
        check(tilings(8, 8) == 12988816, "the classic chessboard count");
        long a = 1, b = 1;
        for (int len = 1; len <= 40; len++) {
            check(tilings(len, 2) == b, "n×2 gives Fibonacci numbers (keep the short side as the columns!)");
            long c = a + b; a = b; b = c;
        }
        for (int r = 1; r <= 5; r++)
            for (int c = 1; c <= 5; c++) {
                long dp = tilings(r, c);
                n = r; m = c;
                check(dp == brute(new boolean[r][c], 0), "dp = brute force " + r + "×" + c);
            }
        System.out.println("Tilings OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
