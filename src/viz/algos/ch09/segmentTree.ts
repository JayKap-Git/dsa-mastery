import type { Frame, Role } from '../../engine/types';

// Mirrors SegmentTree.java (class, sum, add) and MinSegmentTree.java (class, min, set, argmin).
// Both are bottom-up trees stored heap-style: tree[1] is the root, leaves are tree[n .. 2n-1].

export type Kind = 'sum' | 'min';

export interface SegState {
  n: number;
  tree: (number | null)[]; // index 0 unused
  roles: Partial<Record<number, Role>>;
  badges: Partial<Record<number, string>>;
}

const combine = (kind: Kind, x: number, y: number) => (kind === 'sum' ? x + y : Math.min(x, y));
const opWord = (kind: Kind) => (kind === 'sum' ? 'sum' : 'min');

export function buildSeg(kind: Kind, arr: number[]): number[] {
  const n = arr.length;
  const tree = Array<number>(2 * n).fill(0);
  arr.forEach((v, i) => (tree[n + i] = v));
  for (let k = n - 1; k >= 1; k--) tree[k] = combine(kind, tree[2 * k], tree[2 * k + 1]);
  return tree;
}

/** Leaf range [lo, hi] (0-based array indices) that heap node k covers. */
export function coverOf(k: number, n: number): [number, number] {
  let lo = k, hi = k;
  while (lo < n) { lo = 2 * lo; hi = 2 * hi + 1; }
  return [lo - n, hi - n];
}

export function traceSegBuild(kind: Kind, arr: number[]): Frame<SegState>[] {
  const n = arr.length;
  const tree: (number | null)[] = Array(2 * n).fill(null);
  const frames: Frame<SegState>[] = [];
  arr.forEach((v, i) => (tree[n + i] = v));
  frames.push({
    state: { n, tree: [...tree], roles: Object.fromEntries(arr.map((_, i) => [n + i, 'changed' as Role])), badges: {} },
    step: 'leaves',
    say: {
      en: `The array goes into the bottom level: arr[i] is stored at tree[n + i] = tree[${n} + i].`,
      hi: `Array sabse neeche wale level pe jaata hai: arr[i] ko tree[n + i] = tree[${n} + i] pe rakho.`,
    },
    vars: { n },
  });
  for (let k = n - 1; k >= 1; k--) {
    const l = tree[2 * k] as number, r = tree[2 * k + 1] as number;
    tree[k] = combine(kind, l, r);
    const [lo, hi] = coverOf(k, n);
    frames.push({
      state: { n, tree: [...tree], roles: { [2 * k]: 'compare', [2 * k + 1]: 'compare', [k]: 'changed' }, badges: {} },
      step: 'build',
      say: {
        en: `tree[${k}] = ${opWord(kind)}(tree[${2 * k}], tree[${2 * k + 1}]) = ${opWord(kind)}(${l}, ${r}) = ${tree[k]}. It covers arr[${lo}..${hi}].`,
        hi: `tree[${k}] = ${opWord(kind)}(tree[${2 * k}], tree[${2 * k + 1}]) = ${opWord(kind)}(${l}, ${r}) = ${tree[k]}. Yeh node arr[${lo}..${hi}] ko represent karta hai.`,
      },
      vars: { k, 'left child': 2 * k, 'right child': 2 * k + 1 },
    });
  }
  frames.push({
    state: { n, tree: [...tree], roles: { 1: 'done' }, badges: {} },
    say: {
      en: `Built bottom-up in O(n). The root tree[1] = ${tree[1]} is the ${opWord(kind)} of the whole array.`,
      hi: `Neeche se upar O(n) mein ban gaya. Root tree[1] = ${tree[1]} poore array ka ${opWord(kind)} hai.`,
    },
  });
  return frames;
}

export function traceSegQuery(kind: Kind, arr: number[], a0: number, b0: number): Frame<SegState>[] {
  const n = arr.length;
  const tree = buildSeg(kind, arr);
  const frames: Frame<SegState>[] = [];
  const taken: Partial<Record<number, Role>> = {};
  const identity = kind === 'sum' ? 0 : Infinity;
  const show = (v: number) => (v === Infinity ? '∞' : v);
  let s = identity;
  let a = a0 + n, b = b0 + n;
  const accName = kind === 'sum' ? 's' : 'm';

  const rangeRoles = (): Partial<Record<number, Role>> => {
    const r: Partial<Record<number, Role>> = {};
    for (let i = a0; i <= b0; i++) r[n + i] = 'range';
    return r;
  };
  const cursor = (): Partial<Record<number, Role>> => (a <= b ? (a === b ? { [a]: 'active' } : { [a]: 'active', [b]: 'compare' }) : {});
  const badges = (): Partial<Record<number, string>> => (a <= b ? (a === b ? { [a]: 'a=b' } : { [a]: 'a', [b]: 'b' }) : {});
  const st = (extra: Partial<Record<number, Role>> = {}): SegState => ({ n, tree, roles: { ...rangeRoles(), ...taken, ...cursor(), ...extra }, badges: badges() });
  const vars = () => ({ a, b, [accName]: show(s) });

  frames.push({
    state: st(),
    step: 'shift',
    say: {
      en: `${kind === 'sum' ? 'sumq' : 'minq'}(${a0}, ${b0}): start at the leaves. a = ${a0} + ${n} = ${a}, b = ${b0} + ${n} = ${b}.`,
      hi: `${kind === 'sum' ? 'sumq' : 'minq'}(${a0}, ${b0}): leaves se shuru karo. a = ${a0} + ${n} = ${a}, b = ${b0} + ${n} = ${b}.`,
    },
    vars: vars(),
  });

  let level = 0;
  while (a <= b) {
    const aOdd = a % 2 === 1, bEven = b % 2 === 0;
    frames.push({
      state: st(),
      step: 'loop',
      say: aOdd || bEven
        ? {
            en: `a = ${a} ≤ b = ${b}, keep going.${aOdd ? ` a is odd, so it is a right child: its parent would also cover things left of our range.` : ''}${bEven ? ` b is even, so it is a left child: its parent would spill past the right end.` : ''}`,
            hi: `a = ${a} ≤ b = ${b}, aage badho.${aOdd ? ` a odd hai — matlab right child; iska parent humari range ke left ka hissa bhi le lega.` : ''}${bEven ? ` b even hai — matlab left child; iska parent range ke right se bahar chala jayega.` : ''}`,
          }
        : {
            en: `a = ${a} ≤ b = ${b}. a is a left child and b is a right child, so their parents lie fully inside the range — nothing to take on this level.`,
            hi: `a = ${a} ≤ b = ${b}. a left child hai aur b right child, toh dono ke parents poori tarah range ke andar hain — is level pe kuch lena nahi.`,
          },
      vars: vars(),
    });
    // Exactly the Java: `if (a % 2 == 1) s += tree[a++]; if (b % 2 == 0) s += tree[b--];`
    if (aOdd) {
      const v = tree[a];
      s = combine(kind, s, v);
      taken[a] = 'done';
      const [lo, hi] = coverOf(a, n);
      const old = a;
      a++;
      frames.push({
        state: st(),
        step: 'takeA',
        say: {
          en: `Take tree[${old}] = ${v} (covers arr[${lo}..${hi}]) on its own: ${accName} = ${show(s)}. Then a++ → ${a}.`,
          hi: `tree[${old}] = ${v} (arr[${lo}..${hi}]) ko akele hi le lo: ${accName} = ${show(s)}. Phir a++ → ${a}.`,
        },
        vars: vars(),
      });
    }
    if (bEven) {
      const v = tree[b];
      s = combine(kind, s, v);
      taken[b] = 'done';
      const [lo, hi] = coverOf(b, n);
      const old = b;
      b--;
      frames.push({
        state: st(),
        step: 'takeB',
        say: {
          en: `Take tree[${old}] = ${v} (covers arr[${lo}..${hi}]) on its own: ${accName} = ${show(s)}. Then b-- → ${b}.`,
          hi: `tree[${old}] = ${v} (arr[${lo}..${hi}]) ko akele le lo: ${accName} = ${show(s)}. Phir b-- → ${b}.`,
        },
        vars: vars(),
      });
    }
    const pa = a, pb = b;
    a = Math.floor(a / 2);
    b = Math.floor(b / 2);
    level++;
    frames.push({
      state: st(),
      step: 'up',
      say: {
        en: `Move one level up: a = ${pa} / 2 = ${a}, b = ${pb} / 2 = ${b}.${a > b ? ' Now a > b, so every part of the range has been taken.' : ''}`,
        hi: `Ek level upar jao: a = ${pa} / 2 = ${a}, b = ${pb} / 2 = ${b}.${a > b ? ' Ab a > b — poori range cover ho chuki hai.' : ''}`,
      },
      vars: vars(),
    });
  }
  const count = Object.keys(taken).length;
  frames.push({
    state: { n, tree, roles: { ...rangeRoles(), ...taken }, badges: {} },
    step: 'done',
    say: {
      en: `${kind === 'sum' ? 'sumq' : 'minq'}(${a0}, ${b0}) = ${show(s)}, using ${count} node${count === 1 ? '' : 's'} on ${level} level${level === 1 ? '' : 's'}. At most two nodes per level are ever needed, so this is O(log n).`,
      hi: `${kind === 'sum' ? 'sumq' : 'minq'}(${a0}, ${b0}) = ${show(s)} — ${level} levels pe sirf ${count} node use hue. Har level pe max do nodes lagte hain, isliye O(log n).`,
    },
    vars: { [accName]: show(s) },
  });
  return frames;
}

export function traceSegUpdate(kind: Kind, arr: number[], k0: number, x: number): Frame<SegState>[] {
  const n = arr.length;
  const tree: number[] = buildSeg(kind, arr);
  const frames: Frame<SegState>[] = [];
  const path: Partial<Record<number, Role>> = {};
  let k = k0 + n;
  const old = tree[k];
  tree[k] = kind === 'sum' ? tree[k] + x : x;
  path[k] = 'path';
  frames.push({
    state: { n, tree: [...tree], roles: { [k]: 'changed' }, badges: { [k]: 'k' } },
    step: 'leaf',
    say: kind === 'sum'
      ? { en: `add(${k0}, ${x}): the leaf is tree[${k0} + ${n}] = tree[${k}]. It goes from ${old} to ${tree[k]}.`, hi: `add(${k0}, ${x}): leaf hai tree[${k0} + ${n}] = tree[${k}]. Value ${old} se ${tree[k]} ho gayi.` }
      : { en: `set(${k0}, ${x}): the leaf is tree[${k0} + ${n}] = tree[${k}]. It goes from ${old} to ${x}.`, hi: `set(${k0}, ${x}): leaf hai tree[${k0} + ${n}] = tree[${k}]. Value ${old} se ${x} ho gayi.` },
    vars: { k, x },
  });
  for (k = Math.floor(k / 2); k >= 1; k = Math.floor(k / 2)) {
    const before = tree[k];
    tree[k] = combine(kind, tree[2 * k], tree[2 * k + 1]);
    path[k] = 'path';
    frames.push({
      state: { n, tree: [...tree], roles: { ...path, [2 * k]: path[2 * k] ?? 'compare', [2 * k + 1]: path[2 * k + 1] ?? 'compare', [k]: 'changed' }, badges: { [k]: 'k' } },
      step: ['climb', 'recompute'],
      say: {
        en: `Parent tree[${k}] = ${opWord(kind)}(${tree[2 * k]}, ${tree[2 * k + 1]}) = ${tree[k]}${before === tree[k] ? ' (unchanged)' : ` (was ${before})`}.`,
        hi: `Parent tree[${k}] = ${opWord(kind)}(${tree[2 * k]}, ${tree[2 * k + 1]}) = ${tree[k]}${before === tree[k] ? ' (koi badlaav nahi)' : ` (pehle ${before} tha)`}.`,
      },
      vars: { k, x },
    });
  }
  frames.push({
    state: { n, tree: [...tree], roles: { ...path }, badges: {} },
    say: {
      en: `Done: only the ${Object.keys(path).length} nodes on the leaf-to-root path changed. That is O(log n).`,
      hi: `Ho gaya: sirf leaf se root tak ke path ke ${Object.keys(path).length} nodes badle. Yahi O(log n) hai.`,
    },
  });
  return frames;
}

export function traceArgmin(arr: number[]): Frame<SegState>[] {
  const n = arr.length;
  const tree = buildSeg('min', arr);
  const frames: Frame<SegState>[] = [];
  const path: Partial<Record<number, Role>> = { 1: 'path' };
  let k = 1;
  frames.push({
    state: { n, tree, roles: { 1: 'active' }, badges: { 1: 'k' } },
    step: 'root',
    say: {
      en: `The root holds the overall minimum ${tree[1]}. Walk down, always into a child that holds the same value.`,
      hi: `Root mein poore array ka minimum ${tree[1]} hai. Neeche utro — hamesha us child mein jao jisme yahi value ho.`,
    },
    vars: { k },
  });
  while (k < n) {
    const goLeft = tree[2 * k] === tree[k];
    const next = goLeft ? 2 * k : 2 * k + 1;
    frames.push({
      state: { n, tree, roles: { ...path, [2 * k]: 'compare', [2 * k + 1]: 'compare', [next]: 'active' }, badges: { [next]: 'k' } },
      step: ['descend', 'pick'],
      say: {
        en: `Children of tree[${k}]: ${tree[2 * k]} and ${tree[2 * k + 1]}. The ${goLeft ? 'left' : 'right'} one equals ${tree[k]}, so k = ${next}.`,
        hi: `tree[${k}] ke children: ${tree[2 * k]} aur ${tree[2 * k + 1]}. ${goLeft ? 'Left' : 'Right'} wala ${tree[k]} ke barabar hai, toh k = ${next}.`,
      },
      vars: { k: next },
    });
    k = next;
    path[k] = 'path';
  }
  frames.push({
    state: { n, tree, roles: { ...path, [k]: 'done' }, badges: { [k]: 'k' } },
    step: 'done',
    say: {
      en: `Reached leaf tree[${k}], i.e. arr[${k - n}] = ${tree[k]}. Found in O(log n) — a binary search inside the tree.`,
      hi: `Leaf tree[${k}] tak pahunch gaye, yaani arr[${k - n}] = ${tree[k]}. O(log n) mein mil gaya — tree ke andar binary search.`,
    },
    vars: { k, 'answer index': k - n },
  });
  return frames;
}
