import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { sampleTiling, traceEdit, traceGridSum, traceKnapsack, traceLIS, traceMinCoins, traceTilings, traceWays } from './dp';

describe('7.1 coins', () => {
  it('matches the book and brute force', () => {
    const book = [0, 1, 2, 1, 1, 2, 2, 2, 2, 3, 3];
    for (let n = 0; n <= 10; n++) expect(last(traceMinCoins([1, 3, 4], n)).vars?.answer).toBe(book[n]);
    expect(last(traceMinCoins([1, 3, 4], 10)).state.solution!.reduce((s, v) => s + v, 0)).toBe(10);
    expect(last(traceWays([1, 3, 4], 5)).vars?.answer).toBe(6);
    expect(last(traceMinCoins([2, 5], 3)).vars?.answer).toBe('∞');
    expectValidFrames(traceMinCoins([1, 3, 4], 10), 'ch07/CoinDP.java', 'iterative');
    expectValidFrames(traceWays([1, 3, 4], 6), 'ch07/CoinDP.java', 'count');
  });
});

describe('7.2 LIS', () => {
  it('book and brute force', () => {
    expect(last(traceLIS([6, 2, 5, 1, 7, 4, 8, 3])).state.len).toEqual([1, 1, 2, 1, 3, 2, 4, 2]);
    for (let t = 0; t < 200; t++) {
      const a = randArr(rand(1, 10), 0, 9);
      let best = 0;
      for (let m = 1; m < 1 << a.length; m++) {
        const s = a.filter((_, i) => (m >> i) & 1);
        if (s.every((v, i) => i === 0 || s[i - 1] < v)) best = Math.max(best, s.length);
      }
      const f = traceLIS(a);
      expect(last(f).vars?.answer).toBe(best);
      expect(Object.keys(last(f).state.roles).length).toBe(best); // the highlighted chain
      expectValidFrames(f, 'ch07/LIS.java', 'quadratic');
    }
  });
});

describe('7.3–7.6', () => {
  it('grid 67, knapsack sums, LOVE→MOVIE 2, tilings 781', () => {
    const g = [[3, 7, 9, 2, 7], [9, 8, 3, 5, 5], [1, 7, 9, 8, 5], [3, 8, 6, 4, 10], [6, 3, 9, 7, 8]];
    expect(last(traceGridSum(g)).vars?.answer).toBe(67);
    expectValidFrames(traceGridSum(g), 'ch07/GridPathSum.java', 'maxsum');
    const k = last(traceKnapsack([1, 3, 3, 5]));
    expect(k.state.table[4].map((v, x) => (v === '✓' ? -1 : x)).filter((x) => x >= 0)).toEqual([2, 10]);
    expectValidFrames(traceKnapsack([1, 3, 3, 5]), 'ch07/Knapsack.java', 'table');
    const e = last(traceEdit('LOVE', 'MOVIE'));
    expect(e.vars?.answer).toBe(2);
    expect(e.state.ops).toEqual(['modify L→M', 'insert I']);
    expectValidFrames(traceEdit('LOVE', 'MOVIE'), 'ch07/EditDistance.java', 'distance');
    expect(last(traceTilings(4, 7)).vars?.answer).toBe(781);
    expect(last(traceTilings(7, 4)).vars?.answer).toBe(781); // the visualiser's rotated book example
    expect(last(traceTilings(7, 4)).state.counts[0][7]).toBe(781);
    expectValidFrames(traceTilings(3, 4), 'ch07/Tilings.java', 'dp');
    const t = sampleTiling(4, 7, 5)!;
    expect(t.length).toBe(14);
  });
});
