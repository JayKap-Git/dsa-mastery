import type { Frame, Role } from '../../engine/types';
import type { RangeMark } from '../../views/ArrayView';

// Mirrors FenwickTree.java (regions: sum, add, range). Everything is 1-indexed.

export interface FenwickState {
  arr: number[]; // arr[0] unused
  tree: number[]; // tree[0] unused
  roles: Partial<Record<number, Role>>; // by k, shared by the bars and the tree row
  arrRoles: Partial<Record<number, Role>>; // by 1-based position
  ranges: RangeMark[]; // on the array, 0-based slots
}

export const lowbit = (k: number) => k & -k;
export const bin = (k: number, width: number) => k.toString(2).padStart(width, '0');

export function buildFenwick(values: number[]): number[] {
  const n = values.length;
  const tree = [0, ...values];
  for (let k = 1; k <= n; k++) {
    const next = k + lowbit(k);
    if (next <= n) tree[next] += tree[k];
  }
  return tree;
}

const bits = (n: number) => Math.max(1, 32 - Math.clz32(n));

/** Frames for sum(k). `sign` lets the range query reuse it for the "− sumq(1, a−1)" half. */
function sumFrames(arr: number[], tree: number[], k0: number, sign: 1 | -1, carry: Partial<Record<number, Role>>): { frames: Frame<FenwickState>[]; s: number } {
  const n = tree.length - 1;
  const w = bits(n);
  const frames: Frame<FenwickState>[] = [];
  const taken: Partial<Record<number, Role>> = { ...carry };
  const takeRole: Role = sign === 1 ? 'done' : 'minus';
  let s = 0;
  let k = k0;
  const ranges = (): RangeMark[] => (k0 >= 1 ? [{ from: 0, to: k0 - 1, role: sign === 1 ? 'range' : 'minus', label: `sumq(1,${k0})` }] : []);

  if (k0 < 1) {
    frames.push({
      state: { arr, tree, roles: { ...taken }, arrRoles: {}, ranges: [] },
      step: 'done',
      say: { en: 'k = 0, so the loop never runs: sumq(1, 0) = 0.', hi: 'k = 0 hai, loop chalega hi nahi: sumq(1, 0) = 0.' },
      vars: { k: 0, s: 0 },
    });
    return { frames, s: 0 };
  }

  while (k >= 1) {
    const p = lowbit(k);
    frames.push({
      state: { arr, tree, roles: { ...taken, [k]: 'active' }, arrRoles: {}, ranges: ranges() },
      step: 'loop',
      say: {
        en: `k = ${k} (binary ${bin(k, w)}). tree[${k}] covers positions ${k - p + 1}..${k} (length p(${k}) = ${p}).`,
        hi: `k = ${k} (binary ${bin(k, w)}). tree[${k}] positions ${k - p + 1}..${k} ko cover karta hai (length p(${k}) = ${p}).`,
      },
      vars: { k, 'binary k': bin(k, w), 'p(k) = k&-k': p, s },
    });
    s += tree[k];
    taken[k] = takeRole;
    frames.push({
      state: { arr, tree, roles: { ...taken }, arrRoles: {}, ranges: ranges() },
      step: 'take',
      say: { en: `s += tree[${k}] = ${tree[k]} → s = ${s}.`, hi: `s mein tree[${k}] = ${tree[k]} jodo → s = ${s}.` },
      vars: { k, 'binary k': bin(k, w), 'p(k) = k&-k': p, s },
    });
    const nk = k - p;
    frames.push({
      state: { arr, tree, roles: { ...taken, ...(nk >= 1 ? { [nk]: 'active' as Role } : {}) }, arrRoles: {}, ranges: ranges() },
      step: 'jump',
      say: {
        en: `k -= k & -k: clear the lowest set bit. ${bin(k, w)} → ${bin(nk, w)}, so k = ${nk}.${nk === 0 ? ' Nothing is left to cover.' : ''}`,
        hi: `k -= k & -k: sabse neeche wala 1-bit hata do. ${bin(k, w)} → ${bin(nk, w)}, ab k = ${nk}.${nk === 0 ? ' Ab cover karne ko kuch nahi bacha.' : ''}`,
      },
      vars: { k: nk, 'binary k': bin(nk, w), s },
    });
    k = nk;
  }
  frames.push({
    state: { arr, tree, roles: { ...taken }, arrRoles: {}, ranges: ranges() },
    step: 'done',
    say: {
      en: `sumq(1, ${k0}) = ${s}. We touched only ${Object.values(taken).filter((r) => r === takeRole).length} cells — one per 1-bit of ${k0}.`,
      hi: `sumq(1, ${k0}) = ${s}. Sirf ${Object.values(taken).filter((r) => r === takeRole).length} cells touch hue — ${k0} ke har 1-bit ke liye ek.`,
    },
    vars: { k: 0, s },
  });
  return { frames, s };
}

export function traceFenwickSum(values: number[], k: number): Frame<FenwickState>[] {
  const arr = [0, ...values];
  const tree = buildFenwick(values);
  const intro: Frame<FenwickState> = {
    state: { arr, tree, roles: {}, arrRoles: {}, ranges: [{ from: 0, to: k - 1, role: 'range', label: `sumq(1,${k})` }] },
    say: {
      en: `Prefix query sumq(1, ${k}). We jump downwards from k, peeling off one stored range at a time.`,
      hi: `Prefix query sumq(1, ${k}). k se neeche ki taraf jump karenge, har baar ek stored range utha ke.`,
    },
    vars: { k, s: 0 },
  };
  return [intro, ...sumFrames(arr, tree, k, 1, {}).frames];
}

export function traceFenwickRange(values: number[], a: number, b: number): Frame<FenwickState>[] {
  const arr = [0, ...values];
  const tree = buildFenwick(values);
  const right = sumFrames(arr, tree, b, 1, {});
  const carry: Partial<Record<number, Role>> = {};
  const left = sumFrames(arr, tree, a - 1, -1, carry);
  const result = right.s - left.s;
  return [
    {
      state: { arr, tree, roles: {}, arrRoles: {}, ranges: [{ from: a - 1, to: b - 1, role: 'range', label: `sumq(${a},${b})` }] },
      say: {
        en: `sumq(${a}, ${b}) = sumq(1, ${b}) − sumq(1, ${a - 1}): the same trick as prefix sums, with two O(log n) prefix queries.`,
        hi: `sumq(${a}, ${b}) = sumq(1, ${b}) − sumq(1, ${a - 1}) — prefix sums wali hi trick, bas do O(log n) prefix queries.`,
      },
      vars: { a, b },
    },
    ...right.frames,
    ...left.frames,
    {
      state: {
        arr, tree, roles: {},
        arrRoles: Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, 'done' as Role])),
        ranges: [{ from: a - 1, to: b - 1, role: 'done', label: `= ${result}` }],
      },
      say: {
        en: `sumq(${a}, ${b}) = ${right.s} − ${left.s} = ${result}.`,
        hi: `sumq(${a}, ${b}) = ${right.s} − ${left.s} = ${result}.`,
      },
      vars: { result },
    },
  ];
}

export function traceFenwickAdd(values: number[], k0: number, x: number): Frame<FenwickState>[] {
  const n = values.length;
  const w = bits(n);
  const arr = [0, ...values];
  const tree = buildFenwick(values);
  const frames: Frame<FenwickState>[] = [];
  const touched: Partial<Record<number, Role>> = {};

  arr[k0] += x;
  frames.push({
    state: { arr: [...arr], tree: [...tree], roles: {}, arrRoles: { [k0]: 'changed' }, ranges: [] },
    say: {
      en: `add(${k0}, ${x}): arr[${k0}] becomes ${arr[k0]}. Now every stored range that contains position ${k0} must change too.`,
      hi: `add(${k0}, ${x}): arr[${k0}] ab ${arr[k0]} ho gaya. Ab har woh stored range jisme position ${k0} aati hai, use bhi update karna padega.`,
    },
    vars: { k: k0, x },
  });

  let k = k0;
  while (k <= n) {
    const p = lowbit(k);
    frames.push({
      state: { arr: [...arr], tree: [...tree], roles: { ...touched, [k]: 'active' }, arrRoles: { [k0]: 'changed' }, ranges: [{ from: k - p, to: k - 1, role: 'range', label: `tree[${k}]` }] },
      step: 'loop',
      say: {
        en: `k = ${k} (binary ${bin(k, w)}): tree[${k}] covers ${k - p + 1}..${k}, which contains ${k0}.`,
        hi: `k = ${k} (binary ${bin(k, w)}): tree[${k}] range ${k - p + 1}..${k} ko cover karta hai — isme ${k0} hai.`,
      },
      vars: { k, 'binary k': bin(k, w), 'p(k) = k&-k': p, x },
    });
    tree[k] += x;
    touched[k] = 'changed';
    frames.push({
      state: { arr: [...arr], tree: [...tree], roles: { ...touched }, arrRoles: { [k0]: 'changed' }, ranges: [{ from: k - p, to: k - 1, role: 'range', label: `tree[${k}]` }] },
      step: 'take',
      say: { en: `tree[${k}] += ${x} → ${tree[k]}.`, hi: `tree[${k}] mein ${x} jodo → ${tree[k]}.` },
      vars: { k, 'binary k': bin(k, w), 'p(k) = k&-k': p, x },
    });
    const nk = k + p;
    frames.push({
      state: { arr: [...arr], tree: [...tree], roles: { ...touched, ...(nk <= n ? { [nk]: 'active' as Role } : {}) }, arrRoles: { [k0]: 'changed' }, ranges: [] },
      step: 'jump',
      say: {
        en: `k += k & -k: ${bin(k, w)} + ${bin(p, w)} = ${bin(nk, w)}, so k = ${nk}.${nk > n ? ` That is past n = ${n}, so we stop.` : ' This is the next range that contains the position.'}`,
        hi: `k += k & -k: ${bin(k, w)} + ${bin(p, w)} = ${bin(nk, w)}, ab k = ${nk}.${nk > n ? ` Yeh n = ${n} se bahar hai, toh ruk jao.` : ' Yeh agli range hai jisme yeh position aati hai.'}`,
      },
      vars: { k: nk, 'binary k': bin(nk, w), x },
    });
    k = nk;
  }
  const count = Object.keys(touched).length;
  frames.push({
    state: { arr: [...arr], tree: [...tree], roles: { ...touched }, arrRoles: { [k0]: 'changed' }, ranges: [] },
    say: {
      en: `Done: ${count} cells updated, O(log n). A prefix-sum array would have needed to rebuild up to n values.`,
      hi: `Ho gaya: sirf ${count} cells update hue, O(log n). Prefix-sum array hota toh n tak values dobara banani padti.`,
    },
  });
  return frames;
}
