import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { maxSubarrayBrute, traceKadane } from './kadane';
import { CLASSES, ruleFor, sci, verdict } from './complexity';

describe('2.4 Kadane', () => {
  it('matches the book: 10', () => {
    expect(last(traceKadane([-1, 2, 4, -3, 5, 2, -5, 2])).vars?.best).toBe(10);
  });
  it('agrees with brute force', () => {
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 14), -9, 9);
      const f = traceKadane(a);
      expect(last(f).vars?.best).toBe(maxSubarrayBrute(a));
      expectValidFrames(f, 'ch02/MaxSubarray.java', 'kadane');
    }
  });
});

describe('2.3 estimating efficiency', () => {
  it('follows the book’s table', () => {
    const op = (id: string, n: number) => CLASSES.find((c) => c.id === id)!.ops(n);
    expect(verdict(op('n2', 1e5))).toBe('slow'); // 10^10 operations
    expect(verdict(op('nlogn', 1e5))).toBe('fast');
    expect(verdict(op('n', 1e6))).toBe('fast');
    expect(verdict(op('2n', 20))).toBe('fast');
    expect(verdict(op('nfact', 10))).toBe('fast');
    expect(verdict(op('nfact', 13))).toBe('slow');
    expect(ruleFor(1e5)).toBe(4);
    expect(sci(12_345_678)).toBe('1.2·10⁷');
  });
});
