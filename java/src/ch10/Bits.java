package ch10;

import java.util.Arrays;
import java.util.Random;

/** §10.1–10.2 Bit representation and bit operations, the Java way. */
public class Bits {

    // #region print
    /** The 32-bit two's complement representation of x, highest bit first. */
    static String bits(int x) {
        StringBuilder sb = new StringBuilder(32);
        for (int i = 31; i >= 0; i--) {
            sb.append((x & (1 << i)) != 0 ? '1' : '0');
        }
        return sb.toString();
    }
    // #endregion

    // #region tricks
    static boolean hasBit(int x, int k) { return (x & (1 << k)) != 0; }
    static int setBit(int x, int k)     { return x | (1 << k); }
    static int clearBit(int x, int k)   { return x & ~(1 << k); }
    static int flipBit(int x, int k)    { return x ^ (1 << k); }
    static int dropLowest(int x)        { return x & (x - 1); } // clears the last one bit
    static int lowest(int x)            { return x & -x; }      // keeps only the last one bit
    static boolean isPowerOfTwo(int x)  { return x > 0 && (x & (x - 1)) == 0; }
    // #endregion

    // #region builtins
    /** Java's versions of g++'s __builtin_clz, _ctz, _popcount and _parity. Long.* has the same for long. */
    static int[] counts(int x) {
        return new int[] {
            Integer.numberOfLeadingZeros(x),  // zeros at the start (clz)
            Integer.numberOfTrailingZeros(x), // zeros at the end (ctz)
            Integer.bitCount(x),              // number of ones (popcount)
            Integer.bitCount(x) & 1,          // parity of the number of ones
        };
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        check(bits(43).equals("00000000000000000000000000101011"), "43");
        check(bits(-43).equals("11111111111111111111111111010101"), "-43 in two's complement");
        check(-43 == ~43 + 1, "negate = invert + 1");
        check(Integer.toUnsignedString(-43).equals("4294967253"), "-43 read unsigned = 2^32 - 43");
        int max = Integer.MAX_VALUE;
        max++;
        check(max == Integer.MIN_VALUE, "2^31 - 1 + 1 wraps to -2^31");
        check((22 & 26) == 18 && (22 | 26) == 30 && (22 ^ 26) == 12, "and, or, xor");
        check(~29 == -30 && (14 << 2) == 56 && (49 >> 3) == 6, "not, shifts");
        check(Arrays.equals(counts(5328), new int[] {19, 4, 5, 1}), "book counting functions");
        check((-16 >> 2) == -4 && (-16 >>> 28) == 15 && (-7 >> 1) == -4 && -7 / 2 == -3, ">> rounds down, / rounds toward 0");

        Random rnd = new Random(101);
        for (int it = 0; it < 100_000; it++) {
            int x = rnd.nextInt(), k = rnd.nextInt(31);
            check(hasBit(setBit(x, k), k) && !hasBit(clearBit(x, k), k), "set / clear");
            check(flipBit(flipBit(x, k), k) == x && hasBit(flipBit(x, k), k) != hasBit(x, k), "flip");
            check(~x == -x - 1, "~x = -x - 1");
            check((x >> k) == Math.floorDiv(x, 1 << k), "x >> k = floor(x / 2^k)");
            if (x != 0) {
                check(Integer.bitCount(dropLowest(x)) == Integer.bitCount(x) - 1, "x & (x-1) drops one bit");
                check(lowest(x) == Integer.lowestOneBit(x), "x & -x");
            }
            check(isPowerOfTwo(x) == (x > 0 && Integer.bitCount(x) == 1), "power of two");
            int[] c = counts(x);
            check(c[0] == bits(x).indexOf('1') || (x == 0 && c[0] == 32), "clz");
        }
        System.out.println("Bits OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
