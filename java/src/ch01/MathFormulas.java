package ch01;

import java.util.Random;

/** §1.5 Mathematics: closed forms you will reuse, each checked against a loop. */
public class MathFormulas {

    // #region sums
    /** 1 + 2 + ... + n */
    static long sumTo(long n) {
        return n * (n + 1) / 2;
    }

    /** 1² + 2² + ... + n² */
    static long sumSquares(long n) {
        return n * (n + 1) * (2 * n + 1) / 6;
    }
    // #endregion

    // #region progressions
    /** a + ... + b with `count` terms and a constant difference. */
    static long arithmetic(long a, long b, long count) {
        return count * (a + b) / 2;
    }

    /** a + ak + ak² + ... + b with ratio k > 1. */
    static long geometric(long a, long b, long k) {
        return (b * k - a) / (k - 1);
    }
    // #endregion

    // #region floorceil
    /** Integer division in Java truncates toward zero: -7 / 2 == -3, but ⌊-7/2⌋ = -4. */
    static long floorDiv(long a, long b) {
        return Math.floorDiv(a, b);
    }

    /** ⌈a/b⌉ for a ≥ 0 and b > 0, without floating point. */
    static long ceilDiv(long a, long b) {
        return (a + b - 1) / b;
    }
    // #endregion

    // #region logs
    /** ⌊log2 x⌋ for x > 0, exactly (no floating point). */
    static int log2(long x) {
        return 63 - Long.numberOfLeadingZeros(x);
    }

    /** Number of digits of x in base b: ⌊log_b(x)⌋ + 1. */
    static int digits(long x, int base) {
        int d = 0;
        do {
            d++;
            x /= base;
        } while (x > 0);
        return d;
    }
    // #endregion

    // #region fib
    static long fibonacci(int n) {
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            long c = a + b;
            a = b;
            b = c;
        }
        return a;
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        long s = 0, q = 0;
        for (int n = 1; n <= 2000; n++) {
            s += n;
            q += (long) n * n;
            check(sumTo(n) == s && sumSquares(n) == q, "sum formulas at " + n);
        }
        check(arithmetic(3, 15, 4) == 36, "book: 3+7+11+15 = 36");
        check(geometric(3, 24, 2) == 45, "book: 3+6+12+24 = 45");
        check(geometric(1, 1L << 20, 2) == (1L << 21) - 1, "1+2+...+2^20 = 2^21 - 1");

        double h = 0;
        for (int n = 1; n <= 100_000; n++) {
            h += 1.0 / n;
            check(h <= log2(n) + 1 + 1e-9, "harmonic sum ≤ log2(n) + 1");
        }

        check(-7 / 2 == -3 && floorDiv(-7, 2) == -4, "truncation vs floor");
        Random rnd = new Random(1);
        for (int it = 0; it < 10_000; it++) {
            long a = rnd.nextInt(1_000_000), b = 1 + rnd.nextInt(1000);
            check(ceilDiv(a, b) == (long) Math.ceil((double) a / b), "ceilDiv");
        }

        check(log2(32) == 5 && log2(33) == 5 && log2(1) == 0, "log2");
        check(digits(123, 2) == 7 && Long.toString(123, 2).equals("1111011"), "book: 123 has 7 binary digits");
        check(digits(0, 10) == 1 && digits(999, 10) == 3 && digits(1000, 10) == 4, "decimal digits");

        long[] first = {0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55};
        for (int i = 0; i < first.length; i++) check(fibonacci(i) == first[i], "fib " + i);
        check(fibonacci(90) == 2880067194370816120L, "fib 90 fits in long");
        System.out.println("MathFormulas OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
