import type { Frame, Role } from '../../engine/types';
import type { Pointer, RangeMark } from '../../views/ArrayView';

// Mirrors BinarySearch.java (regions: method1, method2, bounds).

export interface BsState {
  a: number[];
  roles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
  pointers: Pointer[];
}

const region = (lo: number, hi: number): Partial<Record<number, Role>> =>
  Object.fromEntries(Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => [lo + i, 'range' as Role]));

export function traceFind(a: number[], x: number): Frame<BsState>[] {
  const frames: Frame<BsState>[] = [];
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    frames.push({
      state: { a, roles: region(lo, hi), ranges: [{ from: lo, to: hi, role: 'range', label: `active region (${hi - lo + 1})` }], pointers: [{ at: lo, label: 'lo' }, { at: hi, label: 'hi' }] },
      step: 'loop',
      say: { en: `x = ${x} can only be in a[${lo}..${hi}] (${hi - lo + 1} elements).`, hi: `x = ${x} sirf a[${lo}..${hi}] mein ho sakta hai (${hi - lo + 1} elements).` },
      vars: { lo, hi, x },
    });
    const k = (lo + hi) >>> 1;
    frames.push({
      state: { a, roles: { ...region(lo, hi), [k]: 'active' }, ranges: [], pointers: [{ at: k, label: 'k' }] },
      step: 'mid',
      say: { en: `Check the middle: a[${k}] = ${a[k]}.`, hi: `Beech wala dekho: a[${k}] = ${a[k]}.` },
      vars: { lo, hi, k, 'a[k]': a[k], x },
    });
    if (a[k] === x) {
      frames.push({
        state: { a, roles: { [k]: 'done' }, ranges: [], pointers: [{ at: k, label: 'k' }] },
        step: 'found',
        say: { en: `Found x = ${x} at index ${k}.`, hi: `x = ${x} index ${k} pe mil gaya.` },
        vars: { k, found: k },
      });
      return frames;
    }
    if (a[k] > x) {
      hi = k - 1;
      frames.push({
        state: { a, roles: region(lo, hi), ranges: [], pointers: [] },
        step: 'left',
        say: { en: `${a[k]} > ${x}, so x must be to the left: hi = ${hi}.`, hi: `${a[k]} > ${x}, toh x left mein hoga: hi = ${hi}.` },
        vars: { lo, hi },
      });
    } else {
      lo = k + 1;
      frames.push({
        state: { a, roles: region(lo, hi), ranges: [], pointers: [] },
        step: 'right',
        say: { en: `${a[k]} < ${x}, so x must be to the right: lo = ${lo}.`, hi: `${a[k]} < ${x}, toh x right mein hoga: lo = ${lo}.` },
        vars: { lo, hi },
      });
    }
  }
  frames.push({
    state: { a, roles: {}, ranges: [], pointers: [] },
    step: 'missing',
    say: { en: `The region is empty: ${x} is not in the array. At most ⌊log₂ n⌋ + 1 checks were needed.`, hi: `Region khaali: ${x} array mein nahi hai. Max ⌊log₂ n⌋ + 1 checks lage.` },
    vars: { found: -1 },
  });
  return frames;
}

export function traceJumps(a: number[], x: number): Frame<BsState>[] {
  const n = a.length;
  const frames: Frame<BsState>[] = [{
    state: { a, roles: { 0: 'active' }, ranges: [], pointers: [{ at: 0, label: 'k' }] },
    say: {
      en: `Method 2: start at k = 0 and walk right with jump lengths n/2, n/4, …, 1, never landing on a value bigger than ${x}.`,
      hi: `Method 2: k = 0 se shuru karo aur n/2, n/4, …, 1 lambi jumps se right chalo — kabhi ${x} se badi value pe mat utro.`,
    },
    vars: { k: 0, x },
  }];
  let k = 0;
  for (let b = Math.floor(n / 2); b >= 1; b = Math.floor(b / 2)) {
    frames.push({
      state: { a, roles: { [k]: 'active' }, ranges: [], pointers: [{ at: k, label: 'k' }] },
      step: 'jump',
      say: { en: `Jump length b = ${b}. Keep jumping right while the landing spot is still ≤ ${x}.`, hi: `Jump length b = ${b}. Jab tak landing spot ≤ ${x} hai, right jump karte raho.` },
      vars: { k, b, x },
    });
    while (k + b < n && a[k + b] <= x) {
      k += b;
      frames.push({
        state: { a, roles: { [k]: 'active', [k - b]: 'path' }, ranges: [{ from: k - b, to: k, role: 'path', label: `+${b}` }], pointers: [{ at: k, label: 'k' }] },
        step: 'move',
        say: { en: `a[${k}] = ${a[k]} ≤ ${x}: jump to k = ${k}.`, hi: `a[${k}] = ${a[k]} ≤ ${x}: k = ${k} pe jump.` },
        vars: { k, b, x },
      });
    }
  }
  const ok = n > 0 && a[k] === x;
  frames.push({
    state: { a, roles: { [k]: ok ? 'done' : 'active' }, ranges: [], pointers: [{ at: k, label: 'k' }] },
    step: 'check',
    say: ok
      ? { en: `All jump lengths done: a[${k}] = ${x}. Found.`, hi: `Saare jumps ho gaye: a[${k}] = ${x}. Mil gaya.` }
      : { en: `All jump lengths done: a[${k}] = ${a[k]} ≠ ${x}, so ${x} is not present.`, hi: `Saare jumps ho gaye: a[${k}] = ${a[k]} ≠ ${x}, toh ${x} nahi hai.` },
    vars: { k, found: ok ? k : -1 },
  });
  return frames;
}

export function traceLowerBound(a: number[], x: number): Frame<BsState>[] {
  const frames: Frame<BsState>[] = [];
  let lo = 0, hi = a.length;
  const box = (): RangeMark[] => [{ from: lo, to: Math.min(hi, a.length - 1), role: 'range', label: hi === a.length ? 'answer in [lo, n]' : 'answer in [lo, hi]' }];
  while (lo < hi) {
    frames.push({
      state: { a, roles: region(lo, Math.min(hi, a.length - 1)), ranges: box(), pointers: [{ at: lo, label: 'lo' }, ...(hi < a.length ? [{ at: hi, label: 'hi' }] : [])] },
      step: 'loop',
      say: { en: `The first element ≥ ${x} is at an index in [${lo}, ${hi}].`, hi: `${x} se bada-ya-barabar pehla element index [${lo}, ${hi}] mein hai.` },
      vars: { lo, hi, x },
    });
    const mid = (lo + hi) >>> 1;
    if (a[mid] >= x) {
      hi = mid;
      frames.push({
        state: { a, roles: { ...region(lo, hi), [mid]: 'active' }, ranges: [], pointers: [{ at: mid, label: 'mid' }] },
        step: ['mid', 'left'],
        say: { en: `a[${mid}] = ${a[mid]} ≥ ${x}: it could be the answer, keep it: hi = ${mid}.`, hi: `a[${mid}] = ${a[mid]} ≥ ${x}: yeh answer ho sakta hai, rakho: hi = ${mid}.` },
        vars: { lo, hi, mid },
      });
    } else {
      lo = mid + 1;
      frames.push({
        state: { a, roles: { ...region(lo, Math.min(hi, a.length - 1)), [mid]: 'muted' }, ranges: [], pointers: [{ at: mid, label: 'mid' }] },
        step: ['mid', 'right'],
        say: { en: `a[${mid}] = ${a[mid]} < ${x}: it and everything left of it are too small: lo = ${lo}.`, hi: `a[${mid}] = ${a[mid]} < ${x}: yeh aur iske left wale sab chhote hain: lo = ${lo}.` },
        vars: { lo, hi, mid },
      });
    }
  }
  frames.push({
    state: { a, roles: lo < a.length ? { [lo]: 'done' } : {}, ranges: [], pointers: lo < a.length ? [{ at: lo, label: 'lb' }] : [] },
    step: 'done',
    say: lo < a.length
      ? { en: `lowerBound(${x}) = ${lo}: a[${lo}] = ${a[lo]} is the first element ≥ ${x}.`, hi: `lowerBound(${x}) = ${lo}: a[${lo}] = ${a[lo]} pehla element hai jo ≥ ${x}.` }
      : { en: `lowerBound(${x}) = ${a.length} (= n): every element is smaller than ${x}.`, hi: `lowerBound(${x}) = ${a.length} (= n): saare elements ${x} se chhote hain.` },
    vars: { result: lo },
  });
  return frames;
}
