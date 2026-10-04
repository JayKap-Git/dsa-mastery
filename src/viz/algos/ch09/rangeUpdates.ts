import type { Frame, Role } from '../../engine/types';
import type { RangeMark } from '../../views/ArrayView';

// Mirrors RangeUpdates.java (region: diff) and IndexCompression.java (region: compress).

export interface DiffState {
  arr: (number | null)[];
  d: (number | null)[];
  arrRoles: Partial<Record<number, Role>>;
  dRoles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
}

export const difference = (arr: number[]) => arr.map((v, k) => v - (k > 0 ? arr[k - 1] : 0));

export function traceDifference(arr: number[]): Frame<DiffState>[] {
  const d: (number | null)[] = arr.map(() => null);
  const frames: Frame<DiffState>[] = [
    {
      state: { arr, d: [...d], arrRoles: {}, dRoles: {}, ranges: [] },
      say: {
        en: 'The difference array stores how much each value differs from the one before it.',
        hi: 'Difference array mein har position pe yeh likhte hain ki value pichhli value se kitni alag hai.',
      },
    },
  ];
  arr.forEach((v, k) => {
    const prev = k > 0 ? arr[k - 1] : 0;
    d[k] = v - prev;
    frames.push({
      state: { arr, d: [...d], arrRoles: { [k]: 'active', ...(k > 0 ? { [k - 1]: 'compare' as Role } : {}) }, dRoles: { [k]: 'changed' }, ranges: [] },
      step: 'diff',
      say: k === 0
        ? { en: `d[0] = arr[0] = ${v}.`, hi: `d[0] = arr[0] = ${v}.` }
        : { en: `d[${k}] = arr[${k}] − arr[${k - 1}] = ${v} − ${prev} = ${d[k]}.`, hi: `d[${k}] = arr[${k}] − arr[${k - 1}] = ${v} − ${prev} = ${d[k]}.` },
      vars: { k, 'd[k]': d[k] as number },
    });
  });
  frames.push({
    state: { arr, d: [...d], arrRoles: {}, dRoles: {}, ranges: [] },
    say: {
      en: 'Key fact: arr is the prefix-sum array of d. For example arr[k] = d[0] + d[1] + … + d[k].',
      hi: 'Asli baat: arr, d ka prefix-sum array hai. Yaani arr[k] = d[0] + d[1] + … + d[k].',
    },
  });
  return frames;
}

export function traceRangeAdd(arr0: number[], a: number, b: number, x: number): Frame<DiffState>[] {
  const n = arr0.length;
  const d = difference(arr0);
  const frames: Frame<DiffState>[] = [];
  const target: RangeMark = { from: a, to: b, role: 'range', label: `+${x}` };

  frames.push({
    state: { arr: arr0, d: [...d], arrRoles: {}, dRoles: {}, ranges: [target] },
    say: {
      en: `Goal: add ${x} to every value in arr[${a}..${b}]. Doing it directly touches ${b - a + 1} cells; with d it takes two.`,
      hi: `Goal: arr[${a}..${b}] ki har value mein ${x} jodna hai. Seedha karo toh ${b - a + 1} cells; d ke saath sirf do.`,
    },
    vars: { a, b, x },
  });

  d[a] += x;
  frames.push({
    state: { arr: arr0, d: [...d], arrRoles: {}, dRoles: { [a]: 'plus' }, ranges: [target] },
    step: 'left',
    say: {
      en: `d[${a}] += ${x}. Every prefix sum from position ${a} onward now grows by ${x}…`,
      hi: `d[${a}] += ${x}. Ab position ${a} se aage ka har prefix sum ${x} se badh jayega…`,
    },
    vars: { a, b, x, 'd[a]': d[a] },
  });

  if (b + 1 < n) {
    d[b + 1] -= x;
    frames.push({
      state: { arr: arr0, d: [...d], arrRoles: {}, dRoles: { [a]: 'plus', [b + 1]: 'minus' }, ranges: [target] },
      step: 'right',
      say: {
        en: `…so d[${b + 1}] −= ${x} cancels it again after position ${b}.`,
        hi: `…isliye d[${b + 1}] −= ${x} karke position ${b} ke baad wo effect cancel kar do.`,
      },
      vars: { a, b, x, 'd[b+1]': d[b + 1] },
    });
  } else {
    frames.push({
      state: { arr: arr0, d: [...d], arrRoles: {}, dRoles: { [a]: 'plus' }, ranges: [target] },
      step: 'right',
      say: {
        en: `b + 1 = ${b + 1} is past the end, so there is nothing to cancel.`,
        hi: `b + 1 = ${b + 1} array ke bahar hai, toh cancel karne ko kuch nahi.`,
      },
      vars: { a, b, x },
    });
  }

  const arr: (number | null)[] = arr0.map(() => null);
  let run = 0;
  for (let k = 0; k < n; k++) {
    run += d[k];
    arr[k] = run;
    const changed = k >= a && k <= b;
    frames.push({
      state: {
        arr: [...arr], d: [...d],
        arrRoles: { [k]: changed ? 'changed' : 'active' },
        dRoles: { [k]: 'compare' },
        ranges: [target],
      },
      step: 'restore',
      say: {
        en: `Restore with a prefix sum: arr[${k}] = ${k > 0 ? `arr[${k - 1}] + ` : ''}d[${k}] = ${run}${changed ? ` (was ${arr0[k]}, now +${x})` : ' (unchanged)'}.`,
        hi: `Prefix sum se wapas banao: arr[${k}] = ${k > 0 ? `arr[${k - 1}] + ` : ''}d[${k}] = ${run}${changed ? ` (pehle ${arr0[k]} tha, ab +${x})` : ' (same raha)'}.`,
      },
      vars: { k, 'arr[k]': run },
    });
  }
  frames.push({
    state: {
      arr: [...arr], d: [...d],
      arrRoles: Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, 'done' as Role])),
      dRoles: { [a]: 'plus', ...(b + 1 < n ? { [b + 1]: 'minus' as Role } : {}) },
      ranges: [{ ...target, role: 'done' }],
    },
    say: {
      en: 'Two point updates on d became a whole range update on arr. Put d in a Fenwick tree and each update and each value lookup costs O(log n).',
      hi: 'd pe do point updates = arr pe poori range ka update. d ko Fenwick tree mein rakho, toh update aur value lookup dono O(log n).',
    },
  });
  return frames;
}

// ───────────────────────── Index compression ─────────────────────────

export interface CompressState {
  xs: number[];
  sorted: number[] | null;
  c: (number | null)[];
  xsRoles: Partial<Record<number, Role>>;
  sortedRoles: Partial<Record<number, Role>>;
}

export function compress(xs: number[]): number[] {
  const sorted = [...new Set(xs)].sort((p, q) => p - q);
  return xs.map((x) => sorted.indexOf(x) + 1);
}

export function traceCompress(xs: number[]): Frame<CompressState>[] {
  const sorted = [...new Set(xs)].sort((p, q) => p - q);
  const c: (number | null)[] = xs.map(() => null);
  const frames: Frame<CompressState>[] = [
    {
      state: { xs, sorted: null, c: [...c], xsRoles: {}, sortedRoles: {} },
      say: {
        en: `Values as large as ${Math.max(...xs)} can't be array indices. But only their order matters, so we replace each with its rank.`,
        hi: `${Math.max(...xs)} jaisi badi values ko array index nahi bana sakte. Par sirf unka order matter karta hai — toh har value ko uski rank se replace kar do.`,
      },
    },
    {
      state: { xs, sorted, c: [...c], xsRoles: {}, sortedRoles: Object.fromEntries(sorted.map((_, i) => [i, 'range' as Role])) },
      step: 'sort',
      say: {
        en: `Sort and remove duplicates: ${sorted.length} distinct values. Position i in this list gives rank i + 1.`,
        hi: `Sort karo aur duplicates hatao: ${sorted.length} distinct values bachi. Is list mein position i matlab rank i + 1.`,
      },
    },
  ];
  xs.forEach((x, i) => {
    const r = sorted.indexOf(x);
    c[i] = r + 1;
    frames.push({
      state: { xs, sorted, c: [...c], xsRoles: { [i]: 'active' }, sortedRoles: { [r]: 'compare' } },
      step: 'map',
      say: {
        en: `Binary search finds ${x} at position ${r}, so c(${x}) = ${r + 1}.`,
        hi: `Binary search se ${x} position ${r} pe mila, toh c(${x}) = ${r + 1}.`,
      },
      vars: { i, x, 'c(x)': r + 1 },
    });
  });
  frames.push({
    state: { xs, sorted, c: [...c], xsRoles: {}, sortedRoles: {} },
    say: {
      en: `Done in O(n log n). Order is preserved (a < b ⇒ c(a) < c(b)), and indices now fit in an array of size ${sorted.length}.`,
      hi: `O(n log n) mein ho gaya. Order same hai (a < b ⇒ c(a) < c(b)), aur ab indices sirf ${sorted.length} size ke array mein fit ho jaate hain.`,
    },
  });
  return frames;
}
