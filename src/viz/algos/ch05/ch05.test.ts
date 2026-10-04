import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { tracePermutations, traceSubsetsBits, traceSubsetsRec } from './generate';
import { KNOWN_Q, traceQueens } from './queens';
import { countPaths } from './gridPaths';
import { subsetSums, traceMitm } from './mitm';

describe('5.1–5.2 generating', () => {
  it('subsets and permutations', () => {
    for (let n = 1; n <= 4; n++) {
      const r = last(traceSubsetsRec(n)).state.found;
      const b = last(traceSubsetsBits(n)).state.found;
      expect(r.length).toBe(2 ** n);
      expect(new Set(r)).toEqual(new Set(b));
      const p = last(tracePermutations(n)).state.found;
      expect(p.length).toBe([1, 1, 2, 6, 24][n]);
      expect(p).toEqual(p.slice().sort());
      expectValidFrames(traceSubsetsRec(n), 'ch05/Generate.java', 'subsets');
      expectValidFrames(traceSubsetsBits(n), 'ch05/Generate.java', 'bitmask');
      expectValidFrames(tracePermutations(n), 'ch05/Generate.java', 'permutations');
    }
  });
});

describe('5.3 n-queens', () => {
  it('counts the known values', () => {
    for (let n = 1; n <= 6; n++) {
      const f = traceQueens(n);
      expect(last(f).vars?.solutions).toBe(KNOWN_Q[n]);
      expectValidFrames(f, 'ch05/NQueens.java', 'backtrack');
    }
  });
});

describe('5.4 grid paths', () => {
  it('every optimisation level gives the same count, with fewer calls', () => {
    const want = [0, 1, 0, 2, 0, 104];
    for (let n = 1; n <= 5; n++) {
      let prev = Infinity;
      for (let lvl = 0; lvl <= 4; lvl++) {
        const r = countPaths(n, lvl);
        expect(r.paths).toBe(want[n]);
        expect(r.calls).toBeLessThanOrEqual(prev);
        prev = r.calls;
      }
    }
  });
});

describe('5.5 meet in the middle', () => {
  it('matches the book and brute force', () => {
    expect(subsetSums([2, 4])).toEqual([0, 2, 4, 6]);
    expect(last(traceMitm([2, 4, 5, 9], 15)).vars?.answer).toBe('yes');
    expect(last(traceMitm([2, 4, 5, 9], 10)).vars?.answer).toBe('no');
    for (let t = 0; t < 300; t++) {
      const a = randArr(rand(1, 8), 1, 15);
      const x = rand(0, 60);
      const brute = subsetSums(a).includes(x);
      const f = traceMitm(a, x);
      expect(last(f).vars?.answer).toBe(brute ? 'yes' : 'no');
      expectValidFrames(f, 'ch05/MeetInTheMiddle.java', 'mitm');
    }
  });
});
