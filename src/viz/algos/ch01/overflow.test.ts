import { describe, expect, it } from 'vitest';
import { evaluate, floorMod, javaRem, parseBig } from './overflow';

describe('Java integer semantics', () => {
  it('reproduces the book example: int * int wraps to -1757895751', () => {
    const r = evaluate(123456789n, 123456789n, '*');
    expect(r.asInt).toBe(-1757895751n);
    expect(r.asLong).toBe(15241578750190521n);
    expect(r.intOverflow).toBe(true);
    expect(r.longOverflow).toBe(false);
  });
  it('wraps long at 2^63', () => {
    const r = evaluate(9223372036854775807n, 1n, '+');
    expect(r.asLong).toBe(-9223372036854775808n);
    expect(r.longOverflow).toBe(true);
    expect(r.asInt).toBeNull(); // a doesn't fit in int
  });
  it('% vs floorMod', () => {
    expect(javaRem(-7n, 3n)).toBe(-1n);
    expect(floorMod(-7n, 3n)).toBe(2n);
    expect(floorMod(7n, 3n)).toBe(1n);
  });
  it('parses friendly input', () => {
    expect(parseBig('1e9')).toBe(1000000000n);
    expect(parseBig('1_000 000,000')).toBe(1000000000n);
    expect(parseBig('-5')).toBe(-5n);
    expect(parseBig('abc')).toBeNull();
  });
});
