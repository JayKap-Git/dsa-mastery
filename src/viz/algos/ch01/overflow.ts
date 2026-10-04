// Java integer semantics, reproduced exactly with BigInt (Numbers.java tests the Java side).

export const INT_MIN = -(2n ** 31n);
export const INT_MAX = 2n ** 31n - 1n;
export const LONG_MIN = -(2n ** 63n);
export const LONG_MAX = 2n ** 63n - 1n;

export type Op = '+' | '-' | '*';

const apply = (a: bigint, b: bigint, op: Op) => (op === '+' ? a + b : op === '-' ? a - b : a * b);

export interface Evaluation {
  exact: bigint;
  /** `int` arithmetic (both operands int): wraps modulo 2^32. Null if an operand doesn't fit in int. */
  asInt: bigint | null;
  /** `long` arithmetic: wraps modulo 2^64. Null if an operand doesn't fit in long. */
  asLong: bigint | null;
  intOverflow: boolean;
  longOverflow: boolean;
}

export const fitsInt = (x: bigint) => x >= INT_MIN && x <= INT_MAX;
export const fitsLong = (x: bigint) => x >= LONG_MIN && x <= LONG_MAX;

export function evaluate(a: bigint, b: bigint, op: Op): Evaluation {
  const exact = apply(a, b, op);
  const asInt = fitsInt(a) && fitsInt(b) ? BigInt.asIntN(32, exact) : null;
  const asLong = fitsLong(a) && fitsLong(b) ? BigInt.asIntN(64, exact) : null;
  return { exact, asInt, asLong, intOverflow: asInt !== null && asInt !== exact, longOverflow: asLong !== null && asLong !== exact };
}

/** Java's `%`: the result has the sign of the dividend (BigInt % behaves the same way). */
export const javaRem = (x: bigint, m: bigint) => x % m;

/** Java's Math.floorMod for m > 0: always in 0..m-1. */
export const floorMod = (x: bigint, m: bigint) => ((x % m) + m) % m;

/** Parse an integer typed by a person: allows spaces, underscores, commas and 1e9-style input. */
export function parseBig(s: string): bigint | null {
  const t = s.replace(/[\s_,]/g, '');
  const sci = /^(-?)(\d+)e(\d{1,2})$/i.exec(t);
  if (sci) return BigInt(sci[1] + sci[2]) * 10n ** BigInt(sci[3]);
  return /^-?\d{1,40}$/.test(t) ? BigInt(t) : null;
}

/** 15241578750190521 → "15,241,578,750,190,521" */
export const group = (x: bigint) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
