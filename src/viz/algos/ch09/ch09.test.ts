import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand, randArr } from '../testing';
import { prefix2D, prefixArray, tracePrefix2DBuild, tracePrefix2DQuery, tracePrefixBuild, tracePrefixQuery } from './prefixSums';
import { buildSparse, sparseMin, traceSparseBuild, traceSparseQuery } from './sparseTable';
import { buildFenwick, traceFenwickAdd, traceFenwickRange, traceFenwickSum } from './fenwick';
import { buildSeg, traceArgmin, traceSegBuild, traceSegQuery, traceSegUpdate } from './segmentTree';
import { compress, traceCompress, traceDifference, traceRangeAdd } from './rangeUpdates';

const sum = (xs: number[], a: number, b: number) => xs.slice(a, b + 1).reduce((s, v) => s + v, 0);
const min = (xs: number[], a: number, b: number) => Math.min(...xs.slice(a, b + 1));
const BOOK_A = [1, 3, 4, 8, 6, 1, 4, 2];
const BOOK_SEG = [5, 8, 6, 3, 2, 7, 2, 6];

describe('9.1 prefix sums', () => {
  it('matches the book', () => {
    expect(prefixArray(BOOK_A)).toEqual([1, 4, 8, 16, 22, 23, 27, 29]);
    expect(last(tracePrefixQuery(BOOK_A, 3, 6)).vars?.result).toBe(19);
  });
  it('build and query agree with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const arr = randArr(rand(1, 16));
      const b = tracePrefixBuild(arr);
      expect(last(b).state.p).toEqual(prefixArray(arr));
      expectValidFrames(b, 'ch09/PrefixSums.java', 'build');
      const a = rand(0, arr.length - 1), c = rand(a, arr.length - 1);
      const q = tracePrefixQuery(arr, a, c);
      expect(last(q).vars?.result).toBe(sum(arr, a, c));
      expectValidFrames(q, 'ch09/PrefixSums.java', 'query');
    }
  });
  it('2D build and rectangle query agree with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const R = rand(1, 6), C = rand(1, 6);
      const g = Array.from({ length: R }, () => randArr(C, -9, 9));
      const b = tracePrefix2DBuild(g);
      expect(last(b).state.s).toEqual(prefix2D(g));
      expectValidFrames(b, 'ch09/PrefixSums.java', 'build2d');
      const r1 = rand(1, R), r2 = rand(r1, R), c1 = rand(1, C), c2 = rand(c1, C);
      let exp = 0;
      for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) exp += g[i - 1][j - 1];
      const q = tracePrefix2DQuery(g, r1, c1, r2, c2);
      expect(last(q).vars?.result).toBe(exp);
      expectValidFrames(q, 'ch09/PrefixSums.java', 'query2d');
    }
  });
});

describe('9.1 sparse table', () => {
  it('matches the book: minq(1,6) = 1 via minq(1,4) and minq(3,6)', () => {
    const q = traceSparseQuery(BOOK_A, 1, 6);
    expect(q[2].vars).toMatchObject({ left: 3, right: 1, k: 4 });
    expect(last(q).vars?.result).toBe(1);
  });
  it('agrees with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const arr = randArr(rand(1, 16));
      const b = traceSparseBuild(arr);
      const mn = buildSparse(arr);
      mn.forEach((row, j) => expect(last(b).state.table[j].slice(0, row.length)).toEqual(row));
      expectValidFrames(b, 'ch09/SparseTable.java', 'build');
      const a = rand(0, arr.length - 1), c = rand(a, arr.length - 1);
      expect(sparseMin(mn, a, c)).toBe(min(arr, a, c));
      const q = traceSparseQuery(arr, a, c);
      expect(last(q).vars?.result).toBe(min(arr, a, c));
      expectValidFrames(q, 'ch09/SparseTable.java', 'query');
    }
  });
});

describe('9.2 Fenwick tree', () => {
  it('matches the book', () => {
    expect(buildFenwick(BOOK_A)).toEqual([0, 1, 4, 4, 16, 6, 7, 4, 29]);
    expect(last(traceFenwickSum(BOOK_A, 7)).vars?.s).toBe(27);
    const add = traceFenwickAdd(BOOK_A, 3, 5);
    const touched = Object.keys(last(add).state.roles).map(Number).sort((x, y) => x - y);
    expect(touched).toEqual([3, 4, 8]);
  });
  it('agrees with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const arr = randArr(rand(1, 16));
      const n = arr.length;
      const k = rand(1, n);
      const s = traceFenwickSum(arr, k);
      expect(last(s).vars?.s).toBe(sum(arr, 0, k - 1));
      expectValidFrames(s, 'ch09/FenwickTree.java', 'sum');
      const a = rand(1, n), b = rand(a, n);
      const r = traceFenwickRange(arr, a, b);
      expect(last(r).vars?.result).toBe(sum(arr, a - 1, b - 1));
      expectValidFrames(r, 'ch09/FenwickTree.java', 'sum');
      const x = rand(-9, 9);
      const u = traceFenwickAdd(arr, k, x);
      const updated = arr.slice();
      updated[k - 1] += x;
      expect(last(u).state.tree).toEqual(buildFenwick(updated));
      expectValidFrames(u, 'ch09/FenwickTree.java', 'add');
    }
  });
});

describe('9.3 segment tree', () => {
  it('matches the book', () => {
    expect(buildSeg('sum', BOOK_SEG)).toEqual([0, 39, 22, 17, 13, 9, 9, 8, 5, 8, 6, 3, 2, 7, 2, 6]);
    const q = last(traceSegQuery('sum', BOOK_SEG, 2, 7));
    expect(q.vars?.s).toBe(26);
    const taken = Object.entries(q.state.roles).filter(([, r]) => r === 'done').map(([k]) => Number(k)).sort((x, y) => x - y);
    expect(taken).toEqual([3, 5]); // the book's two nodes: 9 + 17
    expect(last(traceArgmin([5, 8, 6, 3, 1, 7, 2, 6])).vars?.['answer index']).toBe(4);
  });
  it('build, query, update and argmin agree with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const n = 1 << rand(0, 4);
      const arr = randArr(n);
      for (const kind of ['sum', 'min'] as const) {
        const b = traceSegBuild(kind, arr);
        expect(last(b).state.tree.slice(1)).toEqual(buildSeg(kind, arr).slice(1));
        expectValidFrames(b, kind === 'sum' ? 'ch09/SegmentTree.java' : 'ch09/MinSegmentTree.java', 'class');
        const a = rand(0, n - 1), c = rand(a, n - 1);
        const q = traceSegQuery(kind, arr, a, c);
        const got = last(q).vars?.[kind === 'sum' ? 's' : 'm'];
        expect(got).toBe(kind === 'sum' ? sum(arr, a, c) : min(arr, a, c));
        expectValidFrames(q, kind === 'sum' ? 'ch09/SegmentTree.java' : 'ch09/MinSegmentTree.java', kind === 'sum' ? 'sum' : 'min');
        // never more than two nodes per level
        const taken = Object.entries(last(q).state.roles).filter(([, r]) => r === 'done').map(([k]) => Math.floor(Math.log2(Number(k))));
        const perLevel = new Map<number, number>();
        taken.forEach((l) => perLevel.set(l, (perLevel.get(l) ?? 0) + 1));
        for (const c2 of perLevel.values()) expect(c2).toBeLessThanOrEqual(2);
        const k = rand(0, n - 1), x = rand(-9, 9);
        const u = traceSegUpdate(kind, arr, k, x);
        const updated = arr.slice();
        updated[k] = kind === 'sum' ? updated[k] + x : x;
        expect(last(u).state.tree).toEqual(buildSeg(kind, updated));
        expectValidFrames(u, kind === 'sum' ? 'ch09/SegmentTree.java' : 'ch09/MinSegmentTree.java', kind === 'sum' ? 'add' : 'set');
      }
      const am = traceArgmin(arr);
      expect(arr[last(am).vars?.['answer index'] as number]).toBe(Math.min(...arr));
      expectValidFrames(am, 'ch09/MinSegmentTree.java', 'argmin');
    }
  });
});

describe('9.4 additional techniques', () => {
  it('matches the book', () => {
    const book = [3, 3, 1, 1, 1, 5, 2, 2];
    expect(last(traceDifference(book)).state.d).toEqual([3, 0, -2, 0, 0, 4, -3, 0]);
    const r = last(traceRangeAdd(book, 1, 4, 5));
    expect(r.state.d).toEqual([3, 5, -2, 0, 0, -1, -3, 0]);
    expect(r.state.arr).toEqual([3, 8, 6, 6, 6, 5, 2, 2]);
    expect(compress([555, 1_000_000_000, 8])).toEqual([2, 3, 1]);
  });
  it('agrees with brute force', () => {
    for (let t = 0; t < 200; t++) {
      const arr = randArr(rand(1, 14), -9, 9);
      const n = arr.length;
      const a = rand(0, n - 1), b = rand(a, n - 1), x = rand(-9, 9);
      const fr = traceRangeAdd(arr, a, b, x);
      expect(last(fr).state.arr).toEqual(arr.map((v, i) => (i >= a && i <= b ? v + x : v)));
      expectValidFrames(fr, 'ch09/RangeUpdates.java', 'diff');
      expectValidFrames(traceDifference(arr), 'ch09/RangeUpdates.java', 'diff');
      const xs = randArr(rand(1, 10), 0, 30).map((v) => v * 1000);
      const c = traceCompress(xs);
      expect(last(c).state.c).toEqual(compress(xs));
      expectValidFrames(c, 'ch09/IndexCompression.java', 'compress');
      for (let i = 0; i < xs.length; i++)
        for (let j = 0; j < xs.length; j++) expect(Math.sign(xs[i] - xs[j])).toBe(Math.sign(compress(xs)[i] - compress(xs)[j]));
    }
  });
});
