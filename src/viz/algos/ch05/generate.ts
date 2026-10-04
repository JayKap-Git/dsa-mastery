import type { Frame, Role } from '../../engine/types';

// Mirrors Generate.java (regions: subsets, bitmask, permutations).

export interface GenState {
  /** Heap-indexed recursion tree (subsets): node labels. */
  tree?: (string | null)[];
  treeRoles?: Partial<Record<number, Role>>;
  leaves?: number;
  /** Bits of the current mask, most significant first. */
  bits?: number[];
  bitRoles?: Partial<Record<number, Role>>;
  chosen?: string[];
  chosenRoles?: Partial<Record<number, Role>>;
  current: number[];
  found: string[];
}

export const fmtSet = (s: number[]) => `{${s.join(',')}}`;
export const fmtPerm = (s: number[]) => `(${s.join(',')})`;
/** Compact label for a tree leaf: ∅, 0, 02, 123 … */
export const fmtLeaf = (s: number[]) => (s.length ? s.join('') : '∅');

/** Recursive subsets as a binary recursion tree: node 1 = search(0); left child = skip, right = take. */
export function traceSubsetsRec(n: number): Frame<GenState>[] {
  const size = 1 << (n + 1);
  const tree: (string | null)[] = Array(size).fill(null);
  const frames: Frame<GenState>[] = [];
  const found: string[] = [];
  const subset: number[] = [];
  const done: Partial<Record<number, Role>> = {};
  const pathTo = (node: number) => {
    const r: Partial<Record<number, Role>> = {};
    for (let v = node; v >= 1; v >>= 1) r[v] = 'path';
    return r;
  };
  const snap = (node: number, extra: Partial<Record<number, Role>> = {}): GenState => ({
    tree: tree.slice(), treeRoles: { ...done, ...pathTo(node), [node]: 'active', ...extra }, leaves: 1 << n, current: subset.slice(), found: found.slice(),
  });

  const rec = (k: number, node: number) => {
    tree[node] = k === n ? fmtLeaf(subset) : `k=${k}`;
    if (k === n) {
      found.push(fmtSet(subset));
      done[node] = 'done';
      frames.push({
        state: snap(node, { [node]: 'done' }),
        step: 'leaf',
        say: { en: `k = n: every element is decided. Subset #${found.length}: ${fmtSet(subset)}.`, hi: `k = n: har element ka faisla ho gaya. Subset #${found.length}: ${fmtSet(subset)}.` },
        vars: { k, subsets: found.length },
      });
      return;
    }
    frames.push({
      state: snap(node),
      step: 'skip',
      say: { en: `search(${k}): first leave element ${k} OUT (left branch).`, hi: `search(${k}): pehle element ${k} ko BAHAR rakho (left branch).` },
      vars: { k },
    });
    rec(k + 1, 2 * node);
    subset.push(k);
    frames.push({
      state: snap(node),
      step: 'take',
      say: { en: `Back in search(${k}): now TAKE element ${k} (right branch): subset = ${fmtSet(subset)}.`, hi: `Wapas search(${k}) mein: ab element ${k} ko LO (right branch): subset = ${fmtSet(subset)}.` },
      vars: { k },
    });
    rec(k + 1, 2 * node + 1);
    subset.pop();
    frames.push({
      state: snap(node),
      step: 'undo',
      say: { en: `Undo: remove ${k} again, so the caller sees the subset it handed over.`, hi: `Undo: ${k} ko wapas hatao, taaki caller ko wahi subset mile jo usne diya tha.` },
      vars: { k },
    });
  };
  rec(0, 1);
  frames.push({
    state: { tree: tree.slice(), treeRoles: done, leaves: 1 << n, current: [], found: found.slice() },
    say: { en: `All 2^${n} = ${found.length} subsets, one per leaf. The tree has 2^(n+1) − 1 calls, so this is O(2ⁿ).`, hi: `Saare 2^${n} = ${found.length} subsets — har leaf pe ek. Tree mein 2^(n+1) − 1 calls, yaani O(2ⁿ).` },
  });
  return frames;
}

export function traceSubsetsBits(n: number): Frame<GenState>[] {
  const frames: Frame<GenState>[] = [];
  const found: string[] = [];
  for (let b = 0; b < 1 << n; b++) {
    const bits = Array.from({ length: n }, (_, p) => (b >> (n - 1 - p)) & 1);
    const s = Array.from({ length: n }, (_, i) => i).filter((i) => (b >> i) & 1);
    found.push(fmtSet(s));
    frames.push({
      state: { bits, bitRoles: Object.fromEntries(bits.map((v, p) => [p, v ? ('done' as Role) : ('muted' as Role)])), current: s, found: found.slice() },
      step: ['mask', 'bit'],
      say: { en: `b = ${b} = ${b.toString(2).padStart(n, '0')}₂: bit i set ⇔ element i is in. Subset ${fmtSet(s)}.`, hi: `b = ${b} = ${b.toString(2).padStart(n, '0')}₂: bit i set ⇔ element i andar. Subset ${fmtSet(s)}.` },
      vars: { b, binary: b.toString(2).padStart(n, '0') },
    });
  }
  return frames;
}

export function tracePermutations(n: number): Frame<GenState>[] {
  const frames: Frame<GenState>[] = [];
  const found: string[] = [];
  const perm: number[] = [];
  const chosen = Array(n).fill(false);
  const snap = (hl: Partial<Record<number, Role>> = {}): GenState => ({
    chosen: chosen.map((c) => (c ? '✓' : '·')), chosenRoles: { ...Object.fromEntries(chosen.map((c, i) => [i, c ? ('done' as Role) : undefined]).filter(([, r]) => r)), ...hl }, current: perm.slice(), found: found.slice(),
  });
  frames.push({ state: snap(), say: { en: 'Build the permutation one position at a time, using each unchosen element in turn.', hi: 'Permutation ek-ek position karke banao — har baar koi bhi unchosen element lo.' } });
  const rec = () => {
    if (perm.length === n) {
      found.push(fmtPerm(perm));
      frames.push({ state: snap(), step: 'leaf', say: { en: `Full length: permutation #${found.length} is ${fmtPerm(perm)}.`, hi: `Poori length: permutation #${found.length} = ${fmtPerm(perm)}.` }, vars: { permutations: found.length } });
      return;
    }
    for (let i = 0; i < n; i++) {
      if (chosen[i]) continue;
      chosen[i] = true;
      perm.push(i);
      frames.push({ state: snap({ [i]: 'active' }), step: 'choose', say: { en: `Position ${perm.length - 1} gets ${i} (not used yet).`, hi: `Position ${perm.length - 1} pe ${i} (abhi tak use nahi hua).` }, vars: { i, depth: perm.length } });
      rec();
      chosen[i] = false;
      perm.pop();
      frames.push({ state: snap({ [i]: 'changed' }), step: 'undo', say: { en: `Undo ${i} and try the next element at this position.`, hi: `${i} ko undo karo, is position pe agla element try karo.` }, vars: { i, depth: perm.length } });
    }
  };
  rec();
  frames.push({ state: snap(), say: { en: `All ${found.length} = ${n}! permutations, in lexicographic order.`, hi: `Saare ${found.length} = ${n}! permutations, lexicographic order mein.` } });
  return frames;
}
