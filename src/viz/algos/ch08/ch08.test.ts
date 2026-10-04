import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { traceNearestSmaller, traceSubarraySum, traceTwoSum, traceWindowMin } from './amortized';

const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0);

describe('8.1 two pointers', () => {
  it('subarray sum: book and brute force', () => {
    const book = traceSubarraySum([1, 3, 2, 5, 1, 1, 2, 3], 8);
    expect(last(book).state.found).toEqual([2, 4]);
    expectValidFrames(book, 'ch08/TwoPointers.java', 'subarray');
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 10), 1, 8);
      const x = rand(1, 25);
      let exists = false;
      for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) if (sum(a.slice(i, j + 1)) === x) exists = true;
      const f = traceSubarraySum(a, x);
      const found = last(f).state.found;
      expect(!!found).toBe(exists);
      if (found) expect(sum(a.slice(found[0], found[1] + 1))).toBe(x);
      const moves = f.map((fr) => fr.vars?.['R moves']).filter((v): v is number => typeof v === 'number');
      expect(Math.max(...moves)).toBeLessThanOrEqual(a.length);
      expectValidFrames(f, 'ch08/TwoPointers.java', 'subarray');
    }
  });

  it('2SUM: book and brute force', () => {
    const book = traceTwoSum([1, 4, 5, 6, 7, 9, 9, 10], 12);
    expect(last(book).state.found).toEqual([2, 4]);
    expectValidFrames(book, 'ch08/TwoPointers.java', 'twoSum');
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 10), -10, 10).sort((p, q) => p - q);
      const x = rand(-15, 15);
      let exists = false;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === x) exists = true;
      const f = traceTwoSum(a, x);
      const found = last(f).state.found;
      expect(!!found).toBe(exists);
      if (found) expect(found[0] < found[1] && a[found[0]] + a[found[1]] === x).toBe(true);
      expectValidFrames(f, 'ch08/TwoPointers.java', 'twoSum');
    }
  });
});

describe('8.2 nearest smaller elements', () => {
  it('book and brute force, at most 2n stack operations', () => {
    const book = traceNearestSmaller([1, 3, 4, 2, 5, 3, 4, 2]);
    expect(last(book).state.answer).toEqual(['–', 1, 3, 1, 2, 2, 3, 1]);
    expect(last(book).state.stack).toEqual([0, 7]); // the book's final stack: 1 2
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 10), 0, 9);
      const f = traceNearestSmaller(a);
      const want = a.map((v, i) => {
        for (let j = i - 1; j >= 0; j--) if (a[j] < v) return a[j];
        return '–';
      });
      expect(last(f).state.answer).toEqual(want);
      expect(sum(last(f).state.work)).toBeLessThanOrEqual(2 * a.length);
      expectValidFrames(f, 'ch08/NearestSmaller.java', 'stack');
    }
  });
});

describe('8.3 sliding window minimum', () => {
  it('book and brute force', () => {
    const book = traceWindowMin([2, 1, 4, 5, 3, 4, 1, 2], 4);
    expect(last(book).state.mins).toEqual([1, 1, 3, 1, 1]);
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 10), 0, 9);
      const k = rand(1, a.length);
      const f = traceWindowMin(a, k);
      expect(last(f).state.mins).toEqual(a.slice(0, a.length - k + 1).map((_, i) => Math.min(...a.slice(i, i + k))));
      expect(sum(last(f).state.work)).toBeLessThanOrEqual(2 * a.length);
      expectValidFrames(f, 'ch08/SlidingWindowMin.java', 'deque');
    }
  });
});
