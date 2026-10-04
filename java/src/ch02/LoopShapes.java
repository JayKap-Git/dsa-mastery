package ch02;

/** §2.1 Calculation rules. Each method counts how often its "// code" line runs, so the tests can check the claims. */
public class LoopShapes {

    // #region linear
    static long linear(int n) {
        long ops = 0;
        for (int i = 1; i <= n; i++) {
            ops++; // code
        }
        return ops; // n → O(n)
    }
    // #endregion

    // #region quadratic
    static long quadratic(int n) {
        long ops = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                ops++; // code
            }
        }
        return ops; // n² → O(n²)
    }
    // #endregion

    // #region magnitude
    static long[] sameOrder(int n) {
        long a = 0, b = 0, c = 0;
        for (int i = 1; i <= 3 * n; i++) a++; // 3n
        for (int i = 1; i <= n + 5; i++) b++; // n + 5
        for (int i = 1; i <= n; i += 2) c++; // ⌈n/2⌉
        return new long[] {a, b, c}; // all O(n)
    }

    static long triangle(int n) {
        long ops = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = i + 1; j <= n; j++) {
                ops++; // n(n-1)/2 times → still O(n²)
            }
        }
        return ops;
    }
    // #endregion

    // #region recursion
    static long calls;

    static void f(int n) { // n calls in total → O(n)
        calls++;
        if (n == 1) return;
        f(n - 1);
    }

    static void g(int n) { // 1 + 2 + 4 + ... + 2^(n-1) = 2^n - 1 calls → O(2^n)
        calls++;
        if (n == 1) return;
        g(n - 1);
        g(n - 1);
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        for (int n = 1; n <= 60; n++) {
            check(linear(n) == n && quadratic(n) == (long) n * n, "basic loops");
            long[] s = sameOrder(n);
            check(s[0] == 3L * n && s[1] == n + 5 && s[2] == (n + 1) / 2, "same order of magnitude");
            check(triangle(n) == (long) n * (n - 1) / 2, "triangle");
            calls = 0;
            f(n);
            check(calls == n, "f makes n calls");
        }
        for (int n = 1; n <= 20; n++) {
            calls = 0;
            g(n);
            check(calls == (1L << n) - 1, "g makes 2^n - 1 calls");
        }
        System.out.println("LoopShapes OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
