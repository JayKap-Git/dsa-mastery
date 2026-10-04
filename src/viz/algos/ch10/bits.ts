import type { Bi, Frame, Role } from '../../engine/types';
import type { BitRowSpec } from '../../views/BitTable';

type Roles = Partial<Record<number, Role>>;

/** "{1, 3, 4}" or "∅". */
export const setLabel = (mask: number, sep = ', ') => {
  const e: number[] = [];
  for (let i = 0; i < 31; i++) if ((mask >> i) & 1) e.push(i);
  return e.length ? `{${e.join(sep)}}` : '∅';
};
export const popcount = (x: number) => {
  let c = 0;
  for (let v = x >>> 0; v; v &= v - 1) c++;
  return c;
};

// ───────────── §10.2 playground (pure helpers) ─────────────

export type BitOp = 'and' | 'or' | 'xor' | 'not' | 'neg' | 'shl' | 'shr' | 'ushr' | 'set' | 'clear' | 'flip' | 'dropLowest' | 'lowest';

export const OPS: { op: BitOp; code: string; binary?: boolean; usesK?: boolean; say: Bi }[] = [
  { op: 'and', code: 'x & y', binary: true, say: { en: '1 only where both have a 1. x & 1 tells odd from even; x & (2ᵏ − 1) is x mod 2ᵏ.', hi: '1 sirf wahan jahan dono mein 1. x & 1 se odd/even; x & (2ᵏ − 1) = x mod 2ᵏ.' } },
  { op: 'or', code: 'x | y', binary: true, say: { en: '1 where at least one has a 1: the union of two bit sets.', hi: '1 jahan kam se kam ek mein 1 — do bit sets ka union.' } },
  { op: 'xor', code: 'x ^ y', binary: true, say: { en: '1 where exactly one has a 1, i.e. where they differ. x ^ x = 0.', hi: '1 jahan theek ek mein 1 — yaani jahan dono alag. x ^ x = 0.' } },
  { op: 'not', code: '~x', say: { en: 'Flips all 32 bits. Always ~x = −x − 1.', hi: 'Saare 32 bits ulte. Hamesha ~x = −x − 1.' } },
  { op: 'neg', code: '-x', say: { en: "Two's complement: −x = ~x + 1 (invert, then add one).", hi: "Two's complement: −x = ~x + 1 (ulta karo, phir ek jodo)." } },
  { op: 'shl', code: 'x << k', usesK: true, say: { en: 'Appends k zeros: multiplies by 2ᵏ (bits pushed past bit 31 are lost).', hi: 'k zeros jodta hai: 2ᵏ se guna (bit 31 se aage gaye bits kho jaate hain).' } },
  { op: 'shr', code: 'x >> k', usesK: true, say: { en: 'Drops the last k bits and copies the sign bit in: floor(x / 2ᵏ), even for negative x.', hi: 'Aakhri k bits hata deta hai aur sign bit copy karta hai: floor(x / 2ᵏ), negative x ke liye bhi.' } },
  { op: 'ushr', code: 'x >>> k', usesK: true, say: { en: "Java's unsigned shift: shifts zeros in from the left, so the result (k ≥ 1) is never negative.", hi: 'Java ka unsigned shift: left se zeros aate hain, toh result (k ≥ 1) kabhi negative nahi.' } },
  { op: 'set', code: 'x | (1 << k)', usesK: true, say: { en: 'Sets bit k to 1.', hi: 'Bit k ko 1 karta hai.' } },
  { op: 'clear', code: 'x & ~(1 << k)', usesK: true, say: { en: 'Sets bit k to 0.', hi: 'Bit k ko 0 karta hai.' } },
  { op: 'flip', code: 'x ^ (1 << k)', usesK: true, say: { en: 'Inverts bit k.', hi: 'Bit k ulta karta hai.' } },
  { op: 'dropLowest', code: 'x & (x - 1)', say: { en: 'Clears the last one bit. It is 0 exactly when x is 0 or a power of two.', hi: 'Aakhri one bit hata deta hai. 0 tabhi jab x 0 ho ya 2 ki power.' } },
  { op: 'lowest', code: 'x & -x', say: { en: 'Keeps only the last one bit (Fenwick trees use this as p(k)).', hi: 'Sirf aakhri one bit rakhta hai (Fenwick tree ka p(k) yahi hai).' } },
];

/** Java int semantics (32-bit, shift counts taken mod 32). */
export function applyOp(op: BitOp, x: number, y: number, k: number): number {
  switch (op) {
    case 'and': return x & y;
    case 'or': return x | y;
    case 'xor': return x ^ y;
    case 'not': return ~x;
    case 'neg': return -x | 0;
    case 'shl': return x << k;
    case 'shr': return x >> k;
    case 'ushr': return (x >>> k) | 0;
    case 'set': return x | (1 << k);
    case 'clear': return x & ~(1 << k);
    case 'flip': return x ^ (1 << k);
    case 'dropLowest': return x & (x - 1);
    case 'lowest': return x & -x;
  }
}

/** Integer.numberOfLeadingZeros, numberOfTrailingZeros, bitCount, parity. */
export function javaCounts(x: number) {
  const clz = Math.clz32(x);
  const ctz = x === 0 ? 32 : 31 - Math.clz32(x & -x);
  const pop = popcount(x);
  return { clz, ctz, pop, parity: pop & 1 };
}

/** Parses a Java int literal: decimal, 0b…, 0x…, with an optional minus. Null if it isn't a valid int. */
export function parseInt32(text: string): number | null {
  const t = text.trim().replace(/_/g, '');
  const m = /^(-?)(0b[01]+|0x[0-9a-f]+|\d+)$/i.exec(t);
  if (!m) return null;
  const body = m[2].toLowerCase();
  const v = body.startsWith('0b') ? parseInt(body.slice(2), 2) : body.startsWith('0x') ? parseInt(body.slice(2), 16) : Number(body);
  const signed = m[1] ? -v : v;
  if (!Number.isSafeInteger(signed)) return null;
  if (body.startsWith('0b') || body.startsWith('0x')) {
    if (v > 0xffffffff) return null; // like Java, 0xFFFFFFFF is the int −1
    return m[1] ? -(v | 0) | 0 : v | 0;
  }
  return signed >= -2147483648 && signed <= 2147483647 ? signed : null;
}

// ───────────── §10.3 subsets of x (BitSets.java: submasks) ─────────────

export interface BitsState { rows: BitRowSpec[]; found: number[] }

export function traceSubmasks(x: number, n: number): Frame<BitsState>[] {
  const lowMask = (1 << n) - 1;
  const xRow = (roles?: Roles): BitRowSpec => ({ label: 'x', value: x, note: setLabel(x), roles });
  const found: number[] = [];
  const total = 1 << popcount(x);
  const frames: Frame<BitsState>[] = [{
    state: { rows: [xRow(), { label: 'b', value: 0, note: '∅' }], found: [] },
    say: { en: `x = ${setLabel(x)} has ${popcount(x)} elements, so ${total} subsets. Start with b = 0, the empty set.`, hi: `x = ${setLabel(x)} mein ${popcount(x)} elements, toh ${total} subsets. b = 0 (khaali set) se shuru.` },
  }];
  let b = 0;
  do {
    found.push(b);
    frames.push({
      state: { rows: [xRow(), { label: 'b', value: b, note: setLabel(b), roles: Object.fromEntries([...Array(n)].map((_, i) => [i, (b >> i) & 1 ? 'done' : undefined]).filter(([, r]) => r)) as Roles }], found: found.slice() },
      step: 'visit',
      say: { en: `Process subset ${found.length} of ${total}: b = ${b} = ${setLabel(b)}.`, hi: `Subset ${found.length} / ${total} process karo: b = ${b} = ${setLabel(b)}.` },
      vars: { b, subsets: found.length },
    });
    const diff = (b - x) & lowMask;
    const next = (b - x) & x;
    const outside: Roles = {};
    for (let i = 0; i < n; i++) if (!((x >> i) & 1)) outside[i] = 'muted';
    frames.push({
      state: {
        rows: [
          xRow(),
          { label: 'b', value: b, note: setLabel(b) },
          { label: 'b - x', value: diff, note: `${b - x}`, roles: outside, sep: true },
          { label: '(b - x) & x', value: next, note: setLabel(next), roles: Object.fromEntries([...Array(n)].map((_, i) => [i, ((next ^ b) >> i) & 1 ? 'changed' : undefined]).filter(([, r]) => r)) as Roles },
        ],
        found: found.slice(),
      },
      step: 'next',
      say: next === 0
        ? { en: `(b − x) & x = 0: we're back at the empty set, so the loop stops after all ${total} subsets.`, hi: `(b − x) & x = 0: wapas khaali set pe, toh saare ${total} subsets ke baad loop ruk jaata hai.` }
        : { en: `b − x = b + ~x + 1. Outside x every bit of ~x is 1 (hatched), so the +1 carries straight past them: it's binary counting using only x's positions. & x keeps those positions: next b = ${next} = ${setLabel(next)}.`, hi: `b − x = b + ~x + 1. x ke bahar ~x ke saare bits 1 hain (hatched), toh +1 ka carry seedha unke paar jaata hai — sirf x ki positions pe binary counting. & x wahi positions rakhta hai: agla b = ${next} = ${setLabel(next)}.` },
      vars: { b, 'b - x': b - x, next, subsets: found.length },
    });
    b = next;
  } while (b !== 0);
  return frames;
}

// ───────────── §10.4 Hamming distance (BitOptimizations.java: hamming) ─────────────

export interface HammingState extends BitsState { best: number; bestPair: [number, number] | null }

export function traceHamming(strings: string[]): Frame<HammingState>[] {
  const k = Math.max(...strings.map((s) => s.length));
  const v = strings.map((s) => parseInt(s, 2));
  const pad = (s: string) => s.padStart(k, '0');
  const all = (roles?: (i: number) => Roles): BitRowSpec[] => strings.map((s, i) => ({ label: `s${i}`, value: v[i], note: pad(s), roles: roles?.(i) }));
  let best = Infinity;
  let bestPair: [number, number] | null = null;
  const frames: Frame<HammingState>[] = [{
    state: { rows: all(), found: [], best, bestPair },
    say: { en: `Store each bit string of length ${k} as an int. Positions where two strings differ are exactly the one bits of a ^ b.`, hi: `Har ${k}-length bit string ko int ki tarah rakho. Do strings jahan alag hain, woh theek a ^ b ke one bits hain.` },
  }];
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      const x = v[i] ^ v[j];
      const d = popcount(x);
      const better = d < best;
      if (better) { best = d; bestPair = [i, j]; }
      const diffRoles: Roles = {};
      for (let b = 0; b < k; b++) if ((x >> b) & 1) diffRoles[b] = 'changed';
      frames.push({
        state: {
          rows: [
            { label: `s${i}`, value: v[i], note: pad(strings[i]) },
            { label: `s${j}`, value: v[j], note: pad(strings[j]) },
            { label: `s${i} ^ s${j}`, value: x, note: `bitCount = ${d}`, roles: diffRoles, sep: true },
          ],
          found: [], best, bestPair,
        },
        step: 'pair',
        say: better
          ? { en: `hamming(s${i}, s${j}) = Integer.bitCount(s${i} ^ s${j}) = ${d}: the best so far. One xor and one popcount instead of a loop over ${k} characters.`, hi: `hamming(s${i}, s${j}) = Integer.bitCount(s${i} ^ s${j}) = ${d} — ab tak ka best. ${k} characters ke loop ki jagah ek xor aur ek popcount.` }
          : { en: `hamming(s${i}, s${j}) = ${d}, not better than ${best}.`, hi: `hamming(s${i}, s${j}) = ${d}, ${best} se behtar nahi.` },
        vars: { pair: `s${i}, s${j}`, distance: d, best },
      });
    }
  }
  if (bestPair) {
    const [p, q] = bestPair;
    frames.push({
      state: { rows: all((i) => (i === p || i === q ? Object.fromEntries([...Array(k)].map((_, b) => [b, 'done' as Role])) : {})), found: [], best, bestPair },
      say: { en: `The minimum Hamming distance is ${best}, between s${p} and s${q}. Still O(n²) pairs, but each pair costs O(1) instead of O(k): the book measured 13.5 s → 0.5 s.`, hi: `Minimum Hamming distance ${best} hai, s${p} aur s${q} ke beech. Pairs abhi bhi O(n²), par har pair O(k) ki jagah O(1): book mein 13.5 s → 0.5 s.` },
      vars: { best },
    });
  }
  return frames;
}

// ───────────── §10.5 optimal selection (BitmaskDP.java: selection) ─────────────

export interface SelectionState {
  total: (number | string | null)[][];
  roles: Record<string, Role>;
  priceRoles: Record<string, Role>;
  answer?: number;
}

const showInf = (v: number) => (v === Infinity ? '∞' : v);

export function traceSelection(price: number[][]): Frame<SelectionState>[] {
  const k = price.length, n = price[0].length, S = 1 << k;
  const total: number[][] = Array.from({ length: S }, () => Array(n).fill(Infinity));
  const filled: boolean[][] = Array.from({ length: S }, () => Array(n).fill(false));
  total[0][0] = 0;
  for (let x = 0; x < k; x++) total[1 << x][0] = price[x][0];
  for (let s = 0; s < S; s++) filled[s][0] = true;
  const view = () => total.map((row, s) => row.map((v, d) => (filled[s][d] ? showInf(v) : null)));
  const frames: Frame<SelectionState>[] = [{
    state: { total: view(), roles: Object.fromEntries([...Array(S)].map((_, s) => [`${s},0`, 'changed' as Role])), priceRoles: Object.fromEntries([...Array(k)].map((_, x) => [`${x},0`, 'compare' as Role])) },
    say: { en: `total[S][d] = cheapest way to buy the products in S by day d. Day 0: the empty set costs 0, a single product x costs price[x][0], and two or more are impossible (∞).`, hi: `total[S][d] = day d tak S ke products khareedne ka sabse sasta tareeka. Day 0: khaali set 0, akela product x price[x][0], aur do ya zyada namumkin (∞).` },
  }];
  for (let d = 1; d < n; d++) {
    for (let s = 0; s < S; s++) {
      const skip = total[s][d - 1];
      let best = skip, bestX = -1;
      const opts: string[] = [`skip ${showInf(skip)}`];
      for (let x = 0; x < k; x++) {
        if (!((s >> x) & 1) || total[s ^ (1 << x)][d - 1] === Infinity) continue;
        const c = total[s ^ (1 << x)][d - 1] + price[x][d];
        opts.push(`buy ${x} ${total[s ^ (1 << x)][d - 1]}+${price[x][d]}=${c}`);
        if (c < best) { best = c; bestX = x; }
      }
      total[s][d] = best;
      filled[s][d] = true;
      const roles: Record<string, Role> = { [`${s},${d}`]: 'changed', [`${s},${d - 1}`]: 'compare' };
      const priceRoles: Record<string, Role> = {};
      if (bestX >= 0) { roles[`${s ^ (1 << bestX)},${d - 1}`] = 'range'; priceRoles[`${bestX},${d}`] = 'range'; }
      frames.push({
        state: { total: view(), roles, priceRoles },
        step: opts.length > 1 ? ['skip', 'buy'] : 'skip',
        say: s === 0
          ? { en: `Day ${d}, S = ∅: buying nothing costs 0.`, hi: `Day ${d}, S = ∅: kuch na khareedo toh 0.` }
          : { en: `Day ${d}, S = ${setLabel(s)}: ${opts.join(' · ')} → ${showInf(best)}${bestX >= 0 ? ` (buy product ${bestX} today)` : ''}.`, hi: `Day ${d}, S = ${setLabel(s)}: ${opts.join(' · ')} → ${showInf(best)}${bestX >= 0 ? ` (aaj product ${bestX} khareedo)` : ''}.` },
        vars: { d, S: setLabel(s), 'total[S][d]': showInf(best) },
      });
    }
  }
  // Walk back from (all products, last day) to read off the purchases.
  const roles: Record<string, Role> = {};
  const priceRoles: Record<string, Role> = {};
  const buys: { x: number; d: number }[] = [];
  let s = S - 1;
  const answer = total[S - 1][n - 1];
  if (answer !== Infinity) {
    for (let d = n - 1; d >= 0 && s; d--) {
      roles[`${s},${d}`] = 'path';
      if (d === 0) { const x = 31 - Math.clz32(s); priceRoles[`${x},0`] = 'done'; buys.push({ x, d }); break; }
      if (total[s][d] === total[s][d - 1]) continue;
      for (let x = 0; x < k; x++) {
        if ((s >> x) & 1 && total[s ^ (1 << x)][d - 1] !== Infinity && total[s ^ (1 << x)][d - 1] + price[x][d] === total[s][d]) {
          priceRoles[`${x},${d}`] = 'done';
          buys.push({ x, d });
          s ^= 1 << x;
          break;
        }
      }
    }
  }
  buys.reverse();
  const listEn = buys.map(({ x, d }) => `product ${x} on day ${d} (${price[x][d]})`).join(', ');
  const listHi = buys.map(({ x, d }) => `product ${x} day ${d} pe (${price[x][d]})`).join(', ');
  frames.push({
    state: { total: view(), roles: { ...roles, [`${S - 1},${n - 1}`]: 'done' }, priceRoles, answer: answer === Infinity ? -1 : answer },
    say: answer === Infinity
      ? { en: `More products than days: impossible.`, hi: `Din kam, products zyada: namumkin.` }
      : { en: `Minimum total ${answer}: ${listEn}. O(n · 2ᵏ · k) instead of trying every assignment.`, hi: `Minimum total ${answer}: ${listHi}. Har assignment try karne ki jagah O(n · 2ᵏ · k).` },
    vars: { answer: answer === Infinity ? '∞' : answer },
  });
  return frames;
}

// ───────────── §10.5 elevator rides (BitmaskDP.java: elevator) ─────────────

export interface ElevatorState {
  /** best[s] = [rides, last] once computed. */
  best: ([number, number] | null)[];
  roles: Roles;
  order?: number[];
}

export function traceElevator(w: number[], cap: number): Frame<ElevatorState>[] {
  const n = w.length, S = 1 << n;
  const best: ([number, number] | null)[] = Array(S).fill(null);
  const from: number[] = Array(S).fill(-1);
  best[0] = [1, 0];
  const pair = (b: [number, number]) => `(${b[0]}, ${b[1]})`;
  const frames: Frame<ElevatorState>[] = [{
    state: { best: best.slice(), roles: { 0: 'done' } },
    say: { en: `best[S] = (rides, weight of the last ride) for the people in S, entering in the best order. best[∅] = (1, 0): one empty ride is open. Fewer rides is better; on a tie, a lighter last ride.`, hi: `best[S] = S ke logon ke liye (rides, aakhri ride ka weight), best order mein. best[∅] = (1, 0): ek khaali ride khuli hai. Kam rides behtar; barabar ho toh halki aakhri ride.` },
  }];
  for (let s = 1; s < S; s++) {
    let cur: [number, number] = [n + 1, 0];
    const opts: string[] = [];
    let joined = false, opened = false;
    for (let p = 0; p < n; p++) {
      if (!((s >> p) & 1)) continue;
      let [rides, last] = best[s ^ (1 << p)]!;
      if (last + w[p] <= cap) { last += w[p]; joined = true; } else { rides++; last = w[p]; opened = true; }
      opts.push(`${p} last → (${rides}, ${last})`);
      if (rides < cur[0] || (rides === cur[0] && last < cur[1])) { cur = [rides, last]; from[s] = p; }
    }
    best[s] = cur;
    const roles: Roles = { [s]: 'changed' };
    for (let p = 0; p < n; p++) if ((s >> p) & 1) roles[s ^ (1 << p)] = 'compare';
    roles[s ^ (1 << from[s])] = 'range';
    frames.push({
      state: { best: best.slice(), roles },
      step: ['option', ...(joined ? ['join'] : []), ...(opened ? ['newRide'] : []), 'better'],
      say: { en: `S = ${setLabel(s)}. Try each person as the last to enter: ${opts.join(' · ')}. Best ${pair(cur)}.`, hi: `S = ${setLabel(s)}. Har insaan ko aakhri mein ghusne wala maan ke dekho: ${opts.join(' · ')}. Best ${pair(cur)}.` },
      vars: { S: setLabel(s), 'best[S]': pair(cur) },
    });
  }
  const order: number[] = [];
  for (let s = S - 1; s; s ^= 1 << from[s]) order.push(from[s]);
  order.reverse();
  const groups: number[][] = [[]];
  let load = 0;
  for (const p of order) {
    if (load + w[p] <= cap) { groups[groups.length - 1].push(p); load += w[p]; } else { groups.push([p]); load = w[p]; }
  }
  const rides = groups.map((g) => `{${g.join(', ')}}`).join(' then ');
  frames.push({
    state: { best: best.slice(), roles: { [S - 1]: 'done' }, order },
    say: { en: `${best[S - 1]![0]} rides. Following the choices back gives the order ${order.join(', ')}: rides ${rides}. O(2ⁿ · n) instead of O(n! · n).`, hi: `${best[S - 1]![0]} rides. Choices peeche follow karo toh order ${order.join(', ')}: rides ${rides}. O(n! · n) ki jagah O(2ⁿ · n).` },
    vars: { rides: best[S - 1]![0] },
  });
  return frames;
}

// ───────────── §10.5 sum over subsets (BitmaskDP.java: sos) ─────────────

export interface SosState { table: (number | null)[][]; roles: Record<string, Role> }

export function traceSOS(value: number[]): Frame<SosState>[] {
  const S = value.length, n = Math.round(Math.log2(S));
  const table: (number | null)[][] = [value.slice(), ...Array.from({ length: n }, () => Array(S).fill(null))];
  const sum = value.slice();
  const frames: Frame<SosState>[] = [{
    state: { table: table.map((r) => r.slice()), roles: Object.fromEntries(value.map((_, s) => [`0,${s}`, 'changed' as Role])) },
    say: { en: `Goal: for every set S, the sum of value[A] over all subsets A of S. Start with sum[S] = value[S]: nothing may be removed yet.`, hi: `Goal: har set S ke liye, S ke saare subsets A ka value[A] ka sum. Shuru mein sum[S] = value[S]: abhi kuch hata nahi sakte.` },
  }];
  for (let k = 0; k < n; k++) {
    for (let s = 0; s < S; s++) if (!((s >> k) & 1)) table[k + 1][s] = sum[s];
    frames.push({
      state: { table: table.map((r) => r.slice()), roles: Object.fromEntries([...Array(S)].map((_, s) => [`${k + 1},${s}`, (s >> k) & 1 ? undefined : ('muted' as Role)]).filter(([, r]) => r)) },
      say: { en: `Pass k = ${k}: now element ${k} may also be removed. Sets without ${k} don't change (hatched).`, hi: `Pass k = ${k}: ab element ${k} bhi hata sakte ho. Jin sets mein ${k} nahi, woh nahi badalte (hatched).` },
      vars: { k },
    });
    for (let s = 0; s < S; s++) {
      if (!((s >> k) & 1)) continue;
      const t = s ^ (1 << k);
      const before = sum[s];
      sum[s] += sum[t];
      table[k + 1][s] = sum[s];
      frames.push({
        state: { table: table.map((r) => r.slice()), roles: { [`${k + 1},${s}`]: 'changed', [`${k},${s}`]: 'compare', [`${k},${t}`]: 'range' } },
        step: 'add',
        say: { en: `${setLabel(s)} contains ${k}: either keep ${k} (${before}) or remove it, which adds the sum for ${setLabel(t)} (${sum[t]}). sum = ${sum[s]}.`, hi: `${setLabel(s)} mein ${k} hai: ya ${k} rakho (${before}) ya hatao — tab ${setLabel(t)} ka sum (${sum[t]}) judta hai. sum = ${sum[s]}.` },
        vars: { k, S: setLabel(s), 'sum[S]': sum[s] },
      });
    }
  }
  const example = S > 5 ? 5 : S - 1;
  frames.push({
    state: { table: table.map((r) => r.slice()), roles: Object.fromEntries(sum.map((_, s) => [`${n},${s}`, 'done' as Role])) },
    say: { en: `The last row holds every answer, e.g. sum[${setLabel(example)}] = ${sum[example]}. That's n · 2ⁿ additions instead of looping over all pairs of sets (4ⁿ).`, hi: `Aakhri row mein saare answers, jaise sum[${setLabel(example)}] = ${sum[example]}. Saare set-pairs (4ⁿ) ki jagah sirf n · 2ⁿ additions.` },
    vars: { [`sum[${setLabel(example)}]`]: sum[example] },
  });
  return frames;
}

