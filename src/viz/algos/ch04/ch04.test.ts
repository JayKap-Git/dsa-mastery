import { describe, expect, it } from 'vitest';
import { rand } from '../testing';
import { insertSorted, navigate } from './treeset';

const BOOK = [3, 4, 6, 8, 12, 13, 14, 17];

describe('TreeSet navigation', () => {
  it('matches the Java test values', () => {
    const v = (x: number, q: Parameters<typeof navigate>[2]) => {
      const i = navigate(BOOK, x, q);
      return i < 0 ? null : BOOK[i];
    };
    expect(v(9, 'ceiling')).toBe(12);
    expect(v(12, 'higher')).toBe(13);
    expect(v(3, 'lower')).toBeNull();
    expect(v(5, 'floor')).toBe(4);
    expect(v(10, 'nearest')).toBe(8);
    expect(v(11, 'nearest')).toBe(12);
    expect(v(99, 'nearest')).toBe(17);
  });
  it('agrees with brute force definitions', () => {
    for (let t = 0; t < 500; t++) {
      let s: number[] = [];
      for (let i = 0; i < rand(0, 10); i++) s = insertSorted(s, rand(0, 30));
      const x = rand(-2, 32);
      const pick = (vals: number[], best: (a: number, b: number) => boolean) =>
        vals.reduce<number | null>((acc, v) => (acc === null || best(v, acc) ? v : acc), null);
      const val = (q: Parameters<typeof navigate>[2]) => {
        const i = navigate(s, x, q);
        return i < 0 ? null : s[i];
      };
      expect(val('ceiling')).toBe(pick(s.filter((v) => v >= x), (a, b) => a < b));
      expect(val('higher')).toBe(pick(s.filter((v) => v > x), (a, b) => a < b));
      expect(val('floor')).toBe(pick(s.filter((v) => v <= x), (a, b) => a > b));
      expect(val('lower')).toBe(pick(s.filter((v) => v < x), (a, b) => a > b));
    }
  });
});
