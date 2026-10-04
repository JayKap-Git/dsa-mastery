import type { Frame, Role } from '../../engine/types';
import type { RangeMark } from '../../views/ArrayView';

// Mirrors SparseTable.java (regions: build, query).

export interface SparseState {
  arr: number[];
  table: (number | null)[][]; // table[j][i] = min of arr[i .. i + 2^j - 1]
  tRoles: Record<string, Role>; // `${j},${i}`
  arrRoles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
}

export const levelsFor = (n: number) => 32 - Math.clz32(n);

export function buildSparse(arr: number[]): number[][] {
  const n = arr.length;
  const mn: number[][] = [arr.slice()];
  for (let j = 1; j < levelsFor(n); j++) {
    const w = 1 << (j - 1);
    mn.push(Array.from({ length: n - (1 << j) + 1 }, (_, i) => Math.min(mn[j - 1][i], mn[j - 1][i + w])));
  }
  return mn;
}

export function sparseMin(mn: number[][], a: number, b: number) {
  const j = 31 - Math.clz32(b - a + 1);
  return Math.min(mn[j][a], mn[j][b - (1 << j) + 1]);
}

export function traceSparseBuild(arr: number[]): Frame<SparseState>[] {
  const n = arr.length;
  const L = levelsFor(n);
  const table: (number | null)[][] = Array.from({ length: L }, () => Array(n).fill(null));
  const snap = () => table.map((r) => [...r]);
  const frames: Frame<SparseState>[] = [];

  table[0] = arr.slice();
  frames.push({
    state: { arr, table: snap(), tRoles: Object.fromEntries(arr.map((_, i) => [`0,${i}`, 'changed' as Role])), arrRoles: {}, ranges: [] },
    step: 'base',
    say: {
      en: 'Row 0 holds blocks of length 1, so it is just the array itself.',
      hi: 'Row 0 mein length 1 ke blocks hain — yeh bas array ki copy hai.',
    },
    vars: { j: 0, 'length 2^j': 1 },
  });

  for (let j = 1; j < L; j++) {
    const len = 1 << j, w = len >> 1;
    for (let i = 0; i + len <= n; i++) {
      const left = table[j - 1][i] as number, right = table[j - 1][i + w] as number;
      table[j][i] = Math.min(left, right);
      frames.push({
        state: {
          arr, table: snap(),
          tRoles: { [`${j - 1},${i}`]: 'compare', [`${j - 1},${i + w}`]: 'compare', [`${j},${i}`]: 'changed' },
          arrRoles: {},
          ranges: [
            { from: i, to: i + w - 1, role: 'compare', label: `${left}` },
            { from: i + w, to: i + len - 1, role: 'compare', label: `${right}` },
          ],
        },
        step: 'combine',
        say: {
          en: `Block [${i}, ${i + len - 1}] (length ${len}) = min of its two halves of length ${w}: min(${left}, ${right}) = ${table[j][i]}.`,
          hi: `Block [${i}, ${i + len - 1}] (length ${len}) = uske do halves (length ${w}) ka min: min(${left}, ${right}) = ${table[j][i]}.`,
        },
        vars: { j, i, 'length 2^j': len, w },
      });
    }
  }

  frames.push({
    state: { arr, table: snap(), tRoles: {}, arrRoles: {}, ranges: [] },
    say: {
      en: `Done: ${L} rows, O(n log n) values in total. Each value took O(1) to compute.`,
      hi: `Ho gaya: ${L} rows, total O(n log n) values. Har value O(1) mein bani.`,
    },
  });
  return frames;
}

export function traceSparseQuery(arr: number[], a: number, b: number): Frame<SparseState>[] {
  const mn = buildSparse(arr);
  const table: (number | null)[][] = mn.map((row) => [...row, ...Array(arr.length - row.length).fill(null)]);
  const len = b - a + 1;
  const j = 31 - Math.clz32(len);
  const k = 1 << j;
  const left = mn[j][a], right = mn[j][b - k + 1];
  const ans = Math.min(left, right);
  const st = (tRoles: Record<string, Role>, ranges: RangeMark[], arrRoles: Partial<Record<number, Role>> = {}): SparseState => ({ arr, table, tRoles, arrRoles, ranges });

  return [
    {
      state: st({}, [{ from: a, to: b, role: 'range', label: `minq(${a},${b})` }]),
      say: {
        en: `Query minq(${a}, ${b}). The range has length ${len}.`,
        hi: `Query minq(${a}, ${b}). Range ki length ${len} hai.`,
      },
      vars: { a, b, length: len },
    },
    {
      state: st({}, [{ from: a, to: b, role: 'range', label: `length ${len}` }]),
      step: 'pick',
      say: {
        en: `The largest power of two that fits is k = 2^${j} = ${k}. Two blocks of length ${k} can cover the range, overlapping if needed.`,
        hi: `Sabse bada power of two jo fit hota hai: k = 2^${j} = ${k}. Length ${k} ke do blocks range ko cover kar lenge — overlap ho toh bhi chalega.`,
      },
      vars: { a, b, length: len, j, k },
    },
    {
      state: st(
        { [`${j},${a}`]: 'compare', [`${j},${b - k + 1}`]: 'compare' },
        [
          { from: a, to: a + k - 1, role: 'compare', label: `[${a}, ${a + k - 1}] → ${left}` },
          { from: b - k + 1, to: b, role: 'compare', label: `[${b - k + 1}, ${b}] → ${right}` },
        ],
      ),
      step: 'answer',
      say: {
        en: `[${a}, ${b}] = [${a}, ${a + k - 1}] ∪ [${b - k + 1}, ${b}]. Both minima are already in row ${j}: ${left} and ${right}. Overlap is harmless for min: counting an element twice doesn't change the minimum.`,
        hi: `[${a}, ${b}] = [${a}, ${a + k - 1}] ∪ [${b - k + 1}, ${b}]. Dono ke minimum row ${j} mein ready hain: ${left} aur ${right}. Min mein overlap se koi farak nahi padta — ek element do baar dekh liya toh bhi minimum wahi rahega.`,
      },
      vars: { a, b, j, k, left, right },
    },
    {
      state: st(
        { [`${j},${a}`]: 'done', [`${j},${b - k + 1}`]: 'done' },
        [{ from: a, to: b, role: 'done', label: `= ${ans}` }],
        Object.fromEntries(arr.map((v, i) => [i, i >= a && i <= b && v === ans ? ('done' as Role) : undefined]).filter(([, r]) => r)),
      ),
      step: 'answer',
      say: {
        en: `minq(${a}, ${b}) = min(${left}, ${right}) = ${ans}, in O(1). (This trick only works for idempotent operations like min, max and gcd, not for sums.)`,
        hi: `minq(${a}, ${b}) = min(${left}, ${right}) = ${ans}, O(1) mein. (Yeh trick sirf min, max, gcd jaise operations pe chalti hai jahan overlap safe hai — sum pe nahi.)`,
      },
      vars: { result: ans },
    },
  ];
}
