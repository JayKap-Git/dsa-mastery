package ch05;

/**
 * §5.4 Pruning: count paths from the upper-left to the lower-right corner of an n×n grid that visit
 * every square exactly once. Each level adds one of the book's optimisations; `calls` shows their effect.
 */
public class GridPaths {

    // #region search
    static int n, level;
    static boolean[][] seen;
    static long paths, calls;
    static final int[] DR = {1, 0, -1, 0}, DC = {0, 1, 0, -1}; // down, right, up, left

    static boolean free(int r, int c) {
        return r >= 0 && c >= 0 && r < n && c < n && !seen[r][c];
    }

    static void search(int r, int c, int visited, int dir) {
        calls++;
        if (r == n - 1 && c == n - 1) { // @step corner
            if (visited == n * n) { // @step found
                paths++;
                return;
            }
            if (level >= 2) return; // @step early
        }
        if (level >= 3 && dir >= 0) {
            int ar = r + DR[dir], ac = c + DC[dir];
            boolean wallAhead = ar < 0 || ac < 0 || ar >= n || ac >= n;
            // Optimisation 3: a wall ahead; optimisation 4: anything blocking ahead (wall or the path).
            if (level >= 4 ? !free(ar, ac) : wallAhead) {
                int lf = (dir + 1) % 4, rt = (dir + 3) % 4;
                // Both sides are free, so the unvisited squares are split in two: give up.
                if (free(r + DR[lf], c + DC[lf]) && free(r + DR[rt], c + DC[rt])) return; // @step split
            }
        }
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (!free(nr, nc)) continue;
            seen[nr][nc] = true; // @step move
            search(nr, nc, visited + 1, d);
            seen[nr][nc] = false; // @step back
        }
    }

    static long count(int size, int optimisations) {
        n = size;
        level = optimisations;
        paths = calls = 0;
        seen = new boolean[n][n];
        seen[0][0] = true;
        if (n == 1) return 1;
        if (level >= 1) {
            // Optimisation 1: by symmetry, always step down first and double the answer.
            seen[1][0] = true;
            search(1, 0, 2, 0);
            return 2 * paths;
        }
        search(0, 0, 1, -1);
        return paths;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        long[] want = {0, 1, 0, 2, 0, 104, 0};
        for (int size = 1; size <= 6; size++) {
            long prev = Long.MAX_VALUE;
            for (int opt = 0; opt <= 4; opt++) {
                check(count(size, opt) == want[size], "n=" + size + " opt=" + opt);
                check(calls <= prev, "each optimisation never adds calls");
                prev = calls;
            }
        }
        count(5, 0);
        long basic = calls;
        count(5, 4);
        check(calls * 20 < basic, "pruning cuts the calls a lot: " + basic + " → " + calls);
        check(count(7, 4) == 111712, "book: 7×7 has 111712 paths");
        System.out.println("GridPaths OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
