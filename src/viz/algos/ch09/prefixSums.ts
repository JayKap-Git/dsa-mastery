import type { Frame, Role } from '../../engine/types';
import type { RangeMark } from '../../views/ArrayView';
import type { Region } from '../../views/GridView';

// ───────────────────────── 1D prefix sums (PrefixSums.java: build, query) ─────────────────────────

export interface Prefix1DState {
  arr: number[];
  p: (number | null)[];
  arrRoles: Partial<Record<number, Role>>;
  pRoles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
}

export function prefixArray(arr: number[]): number[] {
  const p: number[] = [];
  arr.forEach((v, k) => p.push((k > 0 ? p[k - 1] : 0) + v));
  return p;
}

export function tracePrefixBuild(arr: number[]): Frame<Prefix1DState>[] {
  const frames: Frame<Prefix1DState>[] = [];
  const p: (number | null)[] = arr.map(() => null);
  frames.push({
    state: { arr, p: [...p], arrRoles: {}, pRoles: {}, ranges: [] },
    say: {
      en: 'Goal: build `p` so that `p[k]` holds the sum of `arr[0..k]`. Each entry reuses the one before it.',
      hi: 'Goal: `p` aisa banana hai ki `p[k]` mein `arr[0..k]` ka sum ho. Har entry pichhli entry ko reuse karti hai — dobara jodna nahi padta.',
    },
  });
  arr.forEach((v, k) => {
    const prev = k > 0 ? (p[k - 1] as number) : 0;
    p[k] = prev + v;
    frames.push({
      state: {
        arr, p: [...p],
        arrRoles: { [k]: 'active' },
        pRoles: { ...(k > 0 ? { [k - 1]: 'compare' as Role } : {}), [k]: 'changed' },
        ranges: [{ from: 0, to: k, role: 'range', label: `sumq(0,${k})` }],
      },
      step: 'fill',
      say: k === 0
        ? { en: `p[0] = arr[0] = ${v}. Nothing comes before it.`, hi: `p[0] = arr[0] = ${v}. Isse pehle kuch nahi hai, toh seedha copy.` }
        : {
            en: `p[${k}] = p[${k - 1}] + arr[${k}] = ${prev} + ${v} = ${p[k]}.`,
            hi: `p[${k}] = pichhla total p[${k - 1}] + naya element arr[${k}] = ${prev} + ${v} = ${p[k]}.`,
          },
      vars: { k, 'arr[k]': v, 'p[k]': p[k] as number },
    });
  });
  frames.push({
    state: { arr, p: [...p], arrRoles: {}, pRoles: Object.fromEntries(arr.map((_, k) => [k, 'done' as Role])), ranges: [] },
    say: {
      en: `Done in O(n): one addition per element. Every p[k] now equals sumq(0, k).`,
      hi: `Ho gaya, O(n) mein — har element pe sirf ek addition. Ab har p[k] = sumq(0, k).`,
    },
  });
  return frames;
}

export function tracePrefixQuery(arr: number[], a: number, b: number): Frame<Prefix1DState>[] {
  const p = prefixArray(arr);
  const pb = p[b];
  const pa = a > 0 ? p[a - 1] : 0;
  const base = { arr, p };
  const frames: Frame<Prefix1DState>[] = [
    {
      state: { ...base, arrRoles: {}, pRoles: {}, ranges: [{ from: a, to: b, role: 'range', label: `sumq(${a},${b})` }] },
      say: {
        en: `Query sumq(${a}, ${b}). A loop would touch ${b - a + 1} elements; with the prefix array we need only two lookups.`,
        hi: `Query hai sumq(${a}, ${b}). Loop chalao toh ${b - a + 1} elements touch karne padenge; prefix array se sirf do lookups kaafi hain.`,
      },
      vars: { a, b },
    },
    {
      state: { ...base, arrRoles: {}, pRoles: { [b]: 'plus' }, ranges: [{ from: 0, to: b, role: 'plus', label: `p[${b}] = ${pb}` }] },
      step: 'answer',
      say: {
        en: `p[${b}] = ${pb} is the sum of everything from 0 up to ${b}. That includes too much on the left…`,
        hi: `p[${b}] = ${pb} matlab 0 se ${b} tak sab ka sum. Isme left side ka extra hissa bhi aa gaya hai…`,
      },
      vars: { a, b, 'p[b]': pb },
    },
    a > 0
      ? {
          state: {
            ...base, arrRoles: {}, pRoles: { [b]: 'plus', [a - 1]: 'minus' },
            ranges: [
              { from: 0, to: b, role: 'plus', label: `p[${b}] = ${pb}` },
              { from: 0, to: a - 1, role: 'minus', label: `p[${a - 1}] = ${pa}` },
            ],
          },
          step: 'answer',
          say: {
            en: `…so subtract p[${a - 1}] = ${pa}, the sum of the part before position ${a}.`,
            hi: `…toh p[${a - 1}] = ${pa} minus kar do — yeh position ${a} se pehle wala extra hissa hai.`,
          },
          vars: { a, b, 'p[b]': pb, 'p[a-1]': pa },
        }
      : {
          state: { ...base, arrRoles: {}, pRoles: { [b]: 'plus' }, ranges: [{ from: 0, to: b, role: 'plus', label: `p[${b}] = ${pb}` }] },
          step: 'answer',
          say: {
            en: `a = 0, so there is nothing before the range: sumq(0, −1) counts as 0.`,
            hi: `a = 0 hai, toh range se pehle kuch hai hi nahi: sumq(0, −1) ko 0 maan lo.`,
          },
          vars: { a, b, 'p[b]': pb, 'p[a-1]': 0 },
        },
    {
      state: {
        ...base,
        arrRoles: Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, 'done' as Role])),
        pRoles: { [b]: 'plus', ...(a > 0 ? { [a - 1]: 'minus' as Role } : {}) },
        ranges: [{ from: a, to: b, role: 'done', label: `= ${pb - pa}` }],
      },
      step: 'answer',
      say: {
        en: `sumq(${a}, ${b}) = ${pb} − ${pa} = ${pb - pa}, in O(1) no matter how long the range is.`,
        hi: `sumq(${a}, ${b}) = ${pb} − ${pa} = ${pb - pa}. Range kitni bhi lambi ho, answer O(1) mein.`,
      },
      vars: { a, b, result: pb - pa },
    },
  ];
  return frames;
}

// ───────────────────────── 2D prefix sums (PrefixSums.java: build2d, query2d) ─────────────────────────

export interface Prefix2DState {
  g: number[][];
  s: (number | null)[][]; // (R+1) x (C+1), row/col 0 are zeros
  gRoles: Record<string, Role>;
  sRoles: Record<string, Role>;
  regions: Region[]; // on g, 0-based cells
}

export function prefix2D(g: number[][]): number[][] {
  const R = g.length, C = g[0].length;
  const s = Array.from({ length: R + 1 }, () => Array(C + 1).fill(0) as number[]);
  for (let i = 1; i <= R; i++)
    for (let j = 1; j <= C; j++) s[i][j] = g[i - 1][j - 1] + s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];
  return s;
}

export function tracePrefix2DBuild(g: number[][]): Frame<Prefix2DState>[] {
  const R = g.length, C = g[0].length;
  const s: (number | null)[][] = Array.from({ length: R + 1 }, (_, i) =>
    Array.from({ length: C + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );
  const snap = () => s.map((row) => [...row]);
  const frames: Frame<Prefix2DState>[] = [
    {
      state: { g, s: snap(), gRoles: {}, sRoles: {}, regions: [] },
      say: {
        en: 's[i][j] will hold the sum of the rectangle from the top-left corner (1,1) to (i,j). Row 0 and column 0 are zero padding.',
        hi: 's[i][j] mein top-left corner (1,1) se (i,j) tak ke rectangle ka sum hoga. Row 0 aur column 0 sirf zero padding hain — edge cases khatam.',
      },
    },
  ];
  for (let i = 1; i <= R; i++) {
    for (let j = 1; j <= C; j++) {
      const up = s[i - 1][j] as number, left = s[i][j - 1] as number, diag = s[i - 1][j - 1] as number, v = g[i - 1][j - 1];
      s[i][j] = v + up + left - diag;
      frames.push({
        state: {
          g, s: snap(),
          gRoles: { [`${i - 1},${j - 1}`]: 'active' },
          sRoles: { [`${i},${j}`]: 'changed', [`${i - 1},${j}`]: 'plus', [`${i},${j - 1}`]: 'plus', [`${i - 1},${j - 1}`]: 'minus' },
          regions: [{ r1: 0, c1: 0, r2: i - 1, c2: j - 1, role: 'range' }],
        },
        step: 'fill',
        say: {
          en: `s[${i}][${j}] = cell ${v} + above ${up} + left ${left} − diagonal ${diag} = ${s[i][j]}. The diagonal block was counted twice, so remove it once.`,
          hi: `s[${i}][${j}] = cell ${v} + upar ${up} + left ${left} − diagonal ${diag} = ${s[i][j]}. Diagonal wala block do baar jud gaya tha, isliye ek baar minus.`,
        },
        vars: { i, j, 'g[i][j]': v, 's[i][j]': s[i][j] as number },
      });
    }
  }
  frames.push({
    state: { g, s: snap(), gRoles: {}, sRoles: {}, regions: [] },
    say: {
      en: `Built in O(R·C). Any rectangle sum is now four lookups away.`,
      hi: `O(R·C) mein ban gaya. Ab koi bhi rectangle ka sum sirf chaar lookups door hai.`,
    },
  });
  return frames;
}

export function tracePrefix2DQuery(g: number[][], r1: number, c1: number, r2: number, c2: number): Frame<Prefix2DState>[] {
  const s = prefix2D(g);
  const A = s[r2][c2], B = s[r1 - 1][c2], Cc = s[r2][c1 - 1], D = s[r1 - 1][c1 - 1];
  const target: Region = { r1: r1 - 1, c1: c1 - 1, r2: r2 - 1, c2: c2 - 1, role: 'done', label: '?' };
  const regA: Region = { r1: 0, c1: 0, r2: r2 - 1, c2: c2 - 1, role: 'plus', label: 'A' };
  const regB: Region | null = r1 > 1 ? { r1: 0, c1: 0, r2: r1 - 2, c2: c2 - 1, role: 'minus', label: 'B' } : null;
  const regC: Region | null = c1 > 1 ? { r1: 0, c1: 0, r2: r2 - 1, c2: c1 - 2, role: 'minus', label: 'C' } : null;
  const regD: Region | null = r1 > 1 && c1 > 1 ? { r1: 0, c1: 0, r2: r1 - 2, c2: c1 - 2, role: 'plus', label: 'D' } : null;
  const only = (...rs: (Region | null)[]) => rs.filter((r): r is Region => r !== null);
  const result = A - B - Cc + D;
  const st = (regions: Region[], sRoles: Record<string, Role>): Prefix2DState => ({ g, s, gRoles: {}, sRoles, regions });

  return [
    {
      state: st([target], {}),
      say: {
        en: `We want the sum of rows ${r1}..${r2}, columns ${c1}..${c2}. Formula: S(A) − S(B) − S(C) + S(D).`,
        hi: `Rows ${r1}..${r2} aur columns ${c1}..${c2} ka sum chahiye. Formula: S(A) − S(B) − S(C) + S(D).`,
      },
      vars: { r1, c1, r2, c2 },
    },
    {
      state: st(only(regA, { ...target, label: '' }), { [`${r2},${c2}`]: 'plus' }),
      step: 'answer',
      say: {
        en: `S(A) = s[${r2}][${c2}] = ${A}: everything from the corner down to the bottom-right of our rectangle.`,
        hi: `S(A) = s[${r2}][${c2}] = ${A}: corner se lekar humare rectangle ke bottom-right tak sab kuch.`,
      },
      vars: { 'S(A)': A },
    },
    {
      state: st(only(regA, regB, { ...target, label: '' }), { [`${r2},${c2}`]: 'plus', [`${r1 - 1},${c2}`]: 'minus' }),
      step: 'answer',
      say: regB
        ? { en: `− S(B) = s[${r1 - 1}][${c2}] = ${B}: remove the rows above the rectangle.`, hi: `− S(B) = s[${r1 - 1}][${c2}] = ${B}: rectangle ke upar wali rows hata do.` }
        : { en: `− S(B): the rectangle starts at row 1, so B is the zero row (0).`, hi: `− S(B): rectangle row 1 se shuru hai, toh B zero row hai (0).` },
      vars: { 'S(A)': A, 'S(B)': B },
    },
    {
      state: st(only(regA, regB, regC, { ...target, label: '' }), { [`${r2},${c2}`]: 'plus', [`${r1 - 1},${c2}`]: 'minus', [`${r2},${c1 - 1}`]: 'minus' }),
      step: 'answer',
      say: regC
        ? { en: `− S(C) = s[${r2}][${c1 - 1}] = ${Cc}: remove the columns to the left.`, hi: `− S(C) = s[${r2}][${c1 - 1}] = ${Cc}: left wale columns bhi hata do.` }
        : { en: `− S(C): the rectangle starts at column 1, so C is the zero column (0).`, hi: `− S(C): rectangle column 1 se shuru hai, toh C zero column hai (0).` },
      vars: { 'S(A)': A, 'S(B)': B, 'S(C)': Cc },
    },
    {
      state: st(only(regA, regB, regC, regD, { ...target, label: '' }), {
        [`${r2},${c2}`]: 'plus', [`${r1 - 1},${c2}`]: 'minus', [`${r2},${c1 - 1}`]: 'minus', [`${r1 - 1},${c1 - 1}`]: 'plus',
      }),
      step: 'answer',
      say: regD
        ? { en: `+ S(D) = s[${r1 - 1}][${c1 - 1}] = ${D}: the top-left block was subtracted twice (in B and in C), so add it back once.`, hi: `+ S(D) = s[${r1 - 1}][${c1 - 1}] = ${D}: top-left block B aur C dono mein minus ho gaya tha — do baar! Isliye ek baar wapas jodo.` }
        : { en: `+ S(D) is 0 here because B or C is empty — nothing was subtracted twice.`, hi: `+ S(D) yahan 0 hai, kyunki B ya C khaali hai — kuch bhi do baar minus nahi hua.` },
      vars: { 'S(A)': A, 'S(B)': B, 'S(C)': Cc, 'S(D)': D },
    },
    {
      state: st([{ ...target, label: String(result) }], {}),
      step: 'answer',
      say: {
        en: `${A} − ${B} − ${Cc} + ${D} = ${result}. Four lookups, O(1).`,
        hi: `${A} − ${B} − ${Cc} + ${D} = ${result}. Sirf chaar lookups, O(1).`,
      },
      vars: { result },
    },
  ];
}
