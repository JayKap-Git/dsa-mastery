import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { traceBubble, traceCounting, traceMerge } from './sorting';
import { traceFind, traceJumps, traceLowerBound } from './binarySearch';

const sorted = (a: number[]) => a.slice().sort((x, y) => x - y);
const inversions = (a: number[]) => {
  let c = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
  return c;
};

describe('3.1 sorting tracers', () => {
  it('sort correctly, and bubble swaps = inversions', () => {
    for (let t = 0; t < 200; t++) {
      const a = randArr(rand(1, 9), 0, 12);
      const b = traceBubble(a);
      expect(last(b).state.a).toEqual(sorted(a));
      expect(last(b).vars?.swaps).toBe(inversions(a));
      expectValidFrames(b, 'ch03/SortingAlgorithms.java', 'bubble');
      const m = traceMerge(a);
      expect(last(m).state.a).toEqual(sorted(a));
      expectValidFrames(m, 'ch03/SortingAlgorithms.java', 'merge');
      const c = traceCounting(a);
      expect(last(c).state.a).toEqual(sorted(a));
      expectValidFrames(c, 'ch03/SortingAlgorithms.java', 'counting');
    }
  });
  it('book: counting sort bookkeeping array', () => {
    const c = traceCounting([1, 3, 6, 9, 9, 3, 5, 9]);
    expect(last(c).state.aux).toEqual([0, 1, 0, 2, 0, 1, 1, 0, 0, 3]);
  });
});

describe('3.3 binary search tracers', () => {
  it('agree with brute force', () => {
    for (let t = 0; t < 400; t++) {
      const a = sorted(randArr(rand(1, 16), 0, 20));
      const x = rand(-1, 21);
      const present = a.includes(x);
      const f = last(traceFind(a, x)).vars?.found as number;
      expect(present ? a[f] === x : f === -1).toBe(true);
      const j = last(traceJumps(a, x)).vars?.found as number;
      expect(present ? a[j] === x : j === -1).toBe(true);
      const lb = a.findIndex((v) => v >= x);
      expect(last(traceLowerBound(a, x)).vars?.result).toBe(lb === -1 ? a.length : lb);
      expectValidFrames(traceFind(a, x), 'ch03/BinarySearch.java', 'method1');
      expectValidFrames(traceJumps(a, x), 'ch03/BinarySearch.java', 'method2');
      expectValidFrames(traceLowerBound(a, x), 'ch03/BinarySearch.java', 'bounds');
    }
  });
});
