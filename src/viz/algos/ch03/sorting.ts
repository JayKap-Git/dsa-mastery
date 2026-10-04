import type { Frame, Role } from '../../engine/types';
import type { Pointer, RangeMark } from '../../views/ArrayView';

// Mirrors SortingAlgorithms.java (regions: bubble, merge, counting).

export interface SortState {
  a: number[];
  roles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
  pointers: Pointer[];
  aux?: (number | null)[]; // tmp array (merge) or count array (counting)
  auxRoles?: Partial<Record<number, Role>>;
  auxBase?: number;
}

const sortedTail = (n: number, rounds: number) =>
  Object.fromEntries(Array.from({ length: Math.min(rounds, n) }, (_, i) => [n - 1 - i, 'done' as Role]));

export function traceBubble(input: number[]): Frame<SortState>[] {
  const a = input.slice();
  const n = a.length;
  const frames: Frame<SortState>[] = [{
    state: { a: a.slice(), roles: {}, ranges: [], pointers: [] },
    say: {
      en: 'Bubble sort: n rounds; in each round compare every neighbouring pair and swap it if it is out of order.',
      hi: 'Bubble sort: n rounds; har round mein har padosi pair compare karo aur galat order ho toh swap karo.',
    },
  }];
  let swaps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - 1; j++) {
      const wrong = a[j] > a[j + 1];
      frames.push({
        state: { a: a.slice(), roles: { ...sortedTail(n, i), [j]: 'compare', [j + 1]: 'compare' }, ranges: [], pointers: [{ at: j, label: 'j' }] },
        step: 'compare',
        say: wrong
          ? { en: `Round ${i + 1}: ${a[j]} > ${a[j + 1]}, out of order: swap.`, hi: `Round ${i + 1}: ${a[j]} > ${a[j + 1]}, galat order: swap karo.` }
          : { en: `Round ${i + 1}: ${a[j]} ≤ ${a[j + 1]}, fine.`, hi: `Round ${i + 1}: ${a[j]} ≤ ${a[j + 1]}, theek hai.` },
        vars: { round: i + 1, j, swaps },
      });
      if (wrong) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        frames.push({
          state: { a: a.slice(), roles: { ...sortedTail(n, i), [j]: 'changed', [j + 1]: 'changed' }, ranges: [], pointers: [{ at: j, label: 'j' }] },
          step: 'swap',
          say: { en: `Swapped. Each swap of neighbours removes exactly one inversion.`, hi: `Swap ho gaya. Padosiyon ka har swap theek ek inversion hatata hai.` },
          vars: { round: i + 1, j, swaps },
        });
      }
    }
  }
  frames.push({
    state: { a: a.slice(), roles: sortedTail(n, n), ranges: [], pointers: [] },
    say: {
      en: `Sorted with ${swaps} swaps, which equals the number of inversions in the input. That is why bubble sort is O(n²).`,
      hi: `${swaps} swaps mein sort ho gaya — input ke inversions jitne hi. Isi wajah se bubble sort O(n²) hai.`,
    },
    vars: { swaps },
  });
  return frames;
}

export function traceMerge(input: number[]): Frame<SortState>[] {
  const a = input.slice();
  const tmp: (number | null)[] = a.map(() => null);
  const frames: Frame<SortState>[] = [{
    state: { a: a.slice(), roles: {}, ranges: [], pointers: [], aux: tmp.slice() },
    say: {
      en: 'Merge sort: split the range in half, sort both halves recursively, then merge the two sorted halves in linear time.',
      hi: 'Merge sort: range ko aadha karo, dono halves ko recursively sort karo, phir dono sorted halves ko linear time mein merge karo.',
    },
  }];

  const rec = (lo: number, hi: number, depth: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >>> 1;
    frames.push({
      state: { a: a.slice(), roles: {}, ranges: [{ from: lo, to: mid, role: 'range', label: 'left' }, { from: mid + 1, to: hi, role: 'compare', label: 'right' }], pointers: [], aux: tmp.slice() },
      step: 'split',
      say: { en: `Sort [${lo}, ${hi}]: split into [${lo}, ${mid}] and [${mid + 1}, ${hi}] (recursion depth ${depth}).`, hi: `[${lo}, ${hi}] sort karo: [${lo}, ${mid}] aur [${mid + 1}, ${hi}] mein todo (recursion depth ${depth}).` },
      vars: { lo, mid, hi },
    });
    rec(lo, mid, depth + 1);
    rec(mid + 1, hi, depth + 1);
    let i = lo, j = mid + 1, k = lo;
    for (let t = lo; t <= hi; t++) tmp[t] = null;
    while (k <= hi) {
      const fromLeft = j > hi || (i <= mid && a[i] <= a[j]);
      const v = fromLeft ? a[i] : a[j];
      const src = fromLeft ? i : j;
      tmp[k] = v;
      frames.push({
        state: {
          a: a.slice(),
          roles: { ...Object.fromEntries(Array.from({ length: hi - lo + 1 }, (_, t) => [lo + t, (lo + t <= mid ? 'range' : 'compare') as Role])), [src]: 'active' },
          ranges: [{ from: lo, to: mid, role: 'range', label: 'left' }, { from: mid + 1, to: hi, role: 'compare', label: 'right' }],
          pointers: [...(i <= mid ? [{ at: i, label: 'i' }] : []), ...(j <= hi ? [{ at: j, label: 'j' }] : [])],
          aux: tmp.slice(),
          auxRoles: { [k]: 'changed' },
        },
        step: i <= mid && j <= hi ? 'take' : j > hi ? 'drainLeft' : 'drainRight',
        say: j > hi || i > mid
          ? { en: `One half is used up: copy ${v} straight across into tmp[${k}].`, hi: `Ek half khatam: ${v} ko seedha tmp[${k}] mein daal do.` }
          : { en: `Compare the fronts ${a[i]} and ${a[j]}: take the smaller, ${v}, into tmp[${k}].`, hi: `Dono ke aage wale ${a[i]} aur ${a[j]} compare karo: chhota wala ${v} tmp[${k}] mein.` },
        vars: { lo, mid, hi, i, j, k },
      });
      if (fromLeft) i++; else j++;
      k++;
    }
    for (let t = lo; t <= hi; t++) a[t] = tmp[t] as number;
    frames.push({
      state: { a: a.slice(), roles: Object.fromEntries(Array.from({ length: hi - lo + 1 }, (_, t) => [lo + t, 'done' as Role])), ranges: [], pointers: [], aux: tmp.slice() },
      step: 'copy',
      say: { en: `Copy tmp back: [${lo}, ${hi}] is now sorted.`, hi: `tmp wapas copy karo: [${lo}, ${hi}] ab sorted hai.` },
      vars: { lo, hi },
    });
  };
  rec(0, a.length - 1, 0);
  frames.push({
    state: { a: a.slice(), roles: Object.fromEntries(a.map((_, i) => [i, 'done' as Role])), ranges: [], pointers: [], aux: tmp.slice() },
    say: {
      en: `Sorted. There are about log₂ n levels of recursion and each level does O(n) merging work, so O(n log n) in total.`,
      hi: `Sort ho gaya. Recursion ke lagbhag log₂ n levels hain aur har level pe O(n) merging, toh total O(n log n).`,
    },
  });
  return frames;
}

export function traceCounting(input: number[]): Frame<SortState>[] {
  const a = input.slice();
  const c = Math.max(0, ...a);
  const count: (number | null)[] = Array(c + 1).fill(0);
  const frames: Frame<SortState>[] = [{
    state: { a: a.slice(), roles: {}, ranges: [], pointers: [], aux: count.slice(), auxBase: 0 },
    say: {
      en: `Counting sort never compares elements. With values in 0..${c}, make a bookkeeping array of ${c + 1} counters.`,
      hi: `Counting sort elements ko compare hi nahi karta. Values 0..${c} mein hain, toh ${c + 1} counters ka bookkeeping array banao.`,
    },
  }];
  a.forEach((x, i) => {
    (count[x] as number)++;
    frames.push({
      state: { a: a.slice(), roles: { [i]: 'active' }, ranges: [], pointers: [], aux: count.slice(), auxRoles: { [x]: 'changed' }, auxBase: 0 },
      step: 'count',
      say: { en: `a[${i}] = ${x}: count[${x}]++ → ${count[x]}.`, hi: `a[${i}] = ${x}: count[${x}]++ → ${count[x]}.` },
      vars: { i, x },
    });
  });
  let k = 0;
  const out = a.map(() => null as number | null);
  for (let v = 0; v <= c; v++) {
    for (let t = 0; t < (count[v] as number); t++) {
      out[k] = v;
      frames.push({
        state: { a: out.map((o) => o ?? 0), roles: { [k]: 'changed', ...Object.fromEntries(Array.from({ length: k }, (_, q) => [q, 'done' as Role])) }, ranges: [], pointers: [], aux: count.slice(), auxRoles: { [v]: 'compare' }, auxBase: 0 },
        step: 'write',
        say: { en: `count[${v}] = ${count[v]}: write ${v} at position ${k}.`, hi: `count[${v}] = ${count[v]}: position ${k} pe ${v} likho.` },
        vars: { v, k },
      });
      k++;
    }
  }
  frames.push({
    state: { a: out.map((o) => o ?? 0), roles: Object.fromEntries(out.map((_, i) => [i, 'done' as Role])), ranges: [], pointers: [], aux: count.slice(), auxBase: 0 },
    say: {
      en: `Sorted in O(n + c). This beats the n log n comparison bound because it never compares; it only works when c is small enough to be an array size.`,
      hi: `O(n + c) mein sort. Yeh n log n wali comparison limit isliye tod deta hai kyunki compare karta hi nahi; par sirf tab chalta hai jab c itna chhota ho ki array size ban sake.`,
    },
  });
  return frames;
}
