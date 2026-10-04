package ch01;

import java.math.BigInteger;
import java.util.Locale;

/** §1.3 Working with numbers, the Java way: overflow, modular arithmetic, floating point. */
public class Numbers {

    // #region overflow
    static long[] overflowDemo() {
        int a = 123456789;
        long wrong = a * a; // int * int is computed in int, THEN widened: -1757895751
        long right = (long) a * a; // widen first: 15241578750190521
        return new long[] {wrong, right};
    }
    // #endregion

    // #region exact
    /** Throws ArithmeticException instead of silently wrapping around. Great for debugging. */
    static long safeMultiply(long a, long b) {
        return Math.multiplyExact(a, b);
    }
    // #endregion

    // #region mod
    static final int MOD = 1_000_000_007;

    /** n! mod m, taking the remainder after every multiplication so nothing overflows. */
    static long factorialMod(int n, long m) {
        long x = 1;
        for (int i = 2; i <= n; i++) {
            x = x * i % m;
        }
        return x % m;
    }

    /** Java's % keeps the sign of the left operand: -7 % 3 == -1. floorMod gives 0..m-1. */
    static long mod(long x, long m) {
        return Math.floorMod(x, m);
    }
    // #endregion

    // #region double
    static boolean nearlyEqual(double a, double b) {
        return Math.abs(a - b) < 1e-9;
    }

    /** Always format with Locale.US: in some locales "%.9f" prints a comma, e.g. 0,333333333. */
    static String format(double x) {
        return String.format(Locale.US, "%.9f", x);
    }
    // #endregion

    // #region bigint
    /** When even long is not enough (|x| > 9·10^18), BigInteger has no limit. */
    static BigInteger twoToThe(int n) {
        return BigInteger.ONE.shiftLeft(n);
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        long[] o = overflowDemo();
        check(o[0] == -1757895751L, "book's overflow value: " + o[0]);
        check(o[1] == 15241578750190521L, "widened product");

        boolean threw = false;
        try {
            safeMultiply(3_037_000_500L, 3_037_000_500L);
        } catch (ArithmeticException e) {
            threw = true;
        }
        check(threw, "multiplyExact detects overflow");
        check(safeMultiply(1_000_000_000L, 1_000_000_000L) == 1_000_000_000_000_000_000L, "multiplyExact ok");

        check(-7 % 3 == -1, "Java % can be negative");
        check(mod(-7, 3) == 2, "floorMod is non-negative");
        check(factorialMod(10, 1_000_000_007) == 3628800, "10! small");
        long brute = 1;
        for (int i = 2; i <= 100; i++) brute = brute * i % MOD;
        check(factorialMod(100, MOD) == brute, "100! mod p");
        // (a + b) mod m == ((a mod m) + (b mod m)) mod m, also for negatives with floorMod
        for (long a = -50; a <= 50; a++)
            for (long b = -50; b <= 50; b++) {
                check(mod(a + b, 7) == mod(mod(a, 7) + mod(b, 7), 7), "add rule");
                check(mod(a - b, 7) == mod(mod(a, 7) - mod(b, 7), 7), "sub rule");
                check(mod(a * b, 7) == mod(mod(a, 7) * mod(b, 7), 7), "mul rule");
            }

        double x = 0.3 * 3 + 0.1;
        check(x != 1.0, "rounding error is real");
        check(nearlyEqual(x, 1.0), "epsilon comparison");
        check(format(1.0 / 3).equals("0.333333333"), "Locale.US formatting");
        check(String.format(Locale.GERMANY, "%.3f", 0.5).equals("0,500"), "the locale trap is real");
        check((double) (1L << 53) + 1 == (double) (1L << 53), "integers above 2^53 lose precision in double");

        check(twoToThe(100).toString().equals("1267650600228229401496703205376"), "2^100");
        System.out.println("Numbers OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
