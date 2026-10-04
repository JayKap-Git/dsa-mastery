package ch05;

/** §5.3 Backtracking: count ways to place n non-attacking queens, one row at a time. */
public class NQueens {

    // #region backtrack
    static int n, count;
    static boolean[] column, diag1, diag2; // diag1: x + y, diag2: x - y + n - 1

    static void search(int y) {
        if (y == n) { // @step solution
            count++;
            return;
        }
        for (int x = 0; x < n; x++) { // @step try
            if (column[x] || diag1[x + y] || diag2[x - y + n - 1]) continue; // @step blocked
            column[x] = diag1[x + y] = diag2[x - y + n - 1] = true; // @step place
            search(y + 1);
            column[x] = diag1[x + y] = diag2[x - y + n - 1] = false; // @step remove
        }
    }

    static int queens(int size) {
        n = size;
        count = 0;
        column = new boolean[n];
        diag1 = new boolean[2 * n - 1];
        diag2 = new boolean[2 * n - 1];
        search(0);
        return count;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        int[] q = {1, 1, 0, 0, 2, 10, 4, 40, 92, 352, 724}; // q(0..10); the book: q(4) = 2, q(8) = 92
        for (int i = 1; i < q.length; i++) check(queens(i) == q[i], "q(" + i + ")");
        System.out.println("NQueens OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
