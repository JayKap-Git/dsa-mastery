import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { applyOp, javaCounts, OPS, parseInt32, popcount, setLabel, traceElevator, traceHamming, traceSelection, traceSOS, traceSubmasks } from './bits';

describe('10.1–10.2 bit operations', () => {
  it('match the book and Java int semantics', () => {
    expect(applyOp('and', 22, 26, 0)).toBe(18);
    expect(applyOp('or', 22, 26, 0)).toBe(30);
    expect(applyOp('xor', 22, 26, 0)).toBe(12);
    expect(applyOp('not', 29, 0, 0)).toBe(-30);
    expect(applyOp('shl', 14, 0, 2)).toBe(56);
    expect(applyOp('shr', 49, 0, 3)).toBe(6);
    expect(applyOp('shr', -7, 0, 1)).toBe(-4); // floor, unlike -7 / 2 = -3 in Java
    expect(applyOp('ushr', -16, 0, 28)).toBe(15);
    expect(applyOp('neg', -2147483648, 0, 0)).toBe(-2147483648); // −MIN_VALUE overflows back to MIN_VALUE
    expect(applyOp('shl', 1, 0, 31)).toBe(-2147483648);
    expect(javaCounts(5328)).toEqual({ clz: 19, ctz: 4, pop: 5, parity: 1 });
    expect(javaCounts(0)).toEqual({ clz: 32, ctz: 32, pop: 0, parity: 0 });
    expect(OPS.map((o) => o.op).length).toBe(new Set(OPS.map((o) => o.op)).size);
    for (let t = 0; t < 2000; t++) {
      const x = (Math.random() * 2 ** 32) | 0, k = rand(0, 30);
      expect(applyOp('dropLowest', x, 0, 0)).toBe(x === 0 ? 0 : x & ~applyOp('lowest', x, 0, 0));
      expect(applyOp('not', x, 0, 0)).toBe((-x - 1) | 0);
      expect(applyOp('flip', applyOp('flip', x, 0, k), 0, k)).toBe(x);
      expect(popcount(applyOp('set', x, 0, k))).toBeGreaterThanOrEqual(popcount(x));
    }
  });

  it('parses Java int literals', () => {
    expect(parseInt32('43')).toBe(43);
    expect(parseInt32('-43')).toBe(-43);
    expect(parseInt32('0b101011')).toBe(43);
    expect(parseInt32('0x2B')).toBe(43);
    expect(parseInt32('0xFFFFFFFF')).toBe(-1);
    expect(parseInt32('2147483647')).toBe(2147483647);
    expect(parseInt32('2147483648')).toBeNull();
    expect(parseInt32('-2147483648')).toBe(-2147483648);
    expect(parseInt32('1_000_000')).toBe(1000000);
    expect(parseInt32('12a')).toBeNull();
    expect(parseInt32('')).toBeNull();
  });
});

describe('10.3 subsets of x', () => {
  it('visits all 2^|x| subsets in increasing order', () => {
    const x = (1 << 1) | (1 << 3) | (1 << 4) | (1 << 8);
    expect(setLabel(x)).toBe('{1, 3, 4, 8}');
    const f = traceSubmasks(x, 10);
    const found = last(f).state.found;
    expect(found.length).toBe(16);
    expect(found.every((b, i) => (b & ~x) === 0 && (i === 0 || b > found[i - 1]))).toBe(true);
    expectValidFrames(f, 'ch10/BitSets.java', 'submasks');
    for (let t = 0; t < 100; t++) {
      const m = rand(0, 255);
      expect(last(traceSubmasks(m, 8)).state.found.length).toBe(1 << popcount(m));
    }
  });
});

describe('10.4 Hamming distance', () => {
  it('book example and brute force', () => {
    const f = traceHamming(['00111', '01101', '11110']);
    expect(last(f).state.best).toBe(2);
    expect(last(f).state.bestPair).toEqual([0, 1]);
    expectValidFrames(f, 'ch10/BitOptimizations.java', 'hamming');
    for (let t = 0; t < 100; t++) {
      const k = rand(1, 8);
      const s = Array.from({ length: rand(2, 6) }, () => Array.from({ length: k }, () => rand(0, 1)).join(''));
      let best = Infinity;
      for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) best = Math.min(best, [...s[i]].filter((c, p) => c !== s[j][p]).length);
      expect(last(traceHamming(s)).state.best).toBe(best);
    }
  });
});

describe('10.5 dynamic programming over subsets', () => {
  it('optimal selection: book total 5, and brute force', () => {
    const price = [[6, 9, 5, 2, 8, 9, 1, 6], [8, 2, 6, 2, 7, 5, 7, 2], [5, 3, 9, 7, 3, 5, 1, 4]];
    const f = traceSelection(price);
    expect(last(f).state.answer).toBe(5);
    expectValidFrames(f, 'ch10/BitmaskDP.java', 'selection');
    const brute = (p: number[][], x: number, used: boolean[]): number => {
      if (x === p.length) return 0;
      let best = Infinity;
      for (let d = 0; d < used.length; d++) if (!used[d]) { used[d] = true; best = Math.min(best, p[x][d] + brute(p, x + 1, used)); used[d] = false; }
      return best;
    };
    for (let t = 0; t < 100; t++) {
      const k = rand(1, 3), n = rand(1, 5);
      const p = Array.from({ length: k }, () => randArr(n, 1, 9));
      const want = brute(p, 0, Array(n).fill(false));
      const got = last(traceSelection(p)).state;
      expect(got.answer).toBe(want === Infinity ? -1 : want);
      if (want !== Infinity) {
        // the highlighted purchases are one product per row on distinct days, summing to the answer
        const picks = Object.keys(got.priceRoles).map((c) => c.split(',').map(Number));
        expect(picks.length).toBe(k);
        expect(new Set(picks.map(([x]) => x)).size).toBe(k);
        expect(new Set(picks.map(([, d]) => d)).size).toBe(k);
        expect(picks.reduce((s2, [x, d]) => s2 + p[x][d], 0)).toBe(want);
      }
    }
  });

  it('elevator rides: book 2 rides and rides({1,3,4}) = (2, 5)', () => {
    const f = traceElevator([2, 3, 3, 5, 6], 10);
    const best = last(f).state.best;
    expect(best[31]![0]).toBe(2);
    expect(best[(1 << 1) | (1 << 3) | (1 << 4)]).toEqual([2, 5]);
    expect([...last(f).state.order!].sort()).toEqual([0, 1, 2, 3, 4]);
    expectValidFrames(f, 'ch10/BitmaskDP.java', 'elevator');
  });

  it('sum over subsets: book sum({0,2}) = 10, and brute force', () => {
    const f = traceSOS([3, 1, 4, 5, 5, 1, 3, 3]);
    expect(last(f).state.table[3][5]).toBe(10);
    expectValidFrames(f, 'ch10/BitmaskDP.java', 'sos');
    for (let t = 0; t < 50; t++) {
      const n = rand(0, 4);
      const v = randArr(1 << n, -9, 9);
      const got = last(traceSOS(v)).state.table[n];
      expect(got).toEqual(v.map((_, s) => v.reduce((acc, val, a) => ((a & ~s) === 0 ? acc + val : acc), 0)));
    }
  });
});
