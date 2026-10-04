import type { Frame, Role } from '../../engine/types';
import type { Interval } from '../../views/TimelineView';
import type { BTNode } from '../../views/BinaryTreeView';

// ───────────── §6.1 coins (CoinGreedy.java: greedy) ─────────────

export interface CoinState {
  coins: number[];
  coinRoles: Partial<Record<number, Role>>;
  taken: number[];
  remaining: number;
  optimal?: number[];
}

/** Minimum-coin solution (DP, chapter 7), as a list of coins. */
export function optimalCoins(coins: number[], n: number): number[] | null {
  const best = Array(n + 1).fill(Infinity), from = Array(n + 1).fill(-1);
  best[0] = 0;
  for (let x = 1; x <= n; x++) for (const c of coins) if (c <= x && best[x - c] + 1 < best[x]) { best[x] = best[x - c] + 1; from[x] = c; }
  if (!Number.isFinite(best[n])) return null;
  const out: number[] = [];
  for (let x = n; x > 0; x -= from[x]) out.push(from[x]);
  return out.sort((a, b) => b - a);
}

export function traceCoins(coinsIn: number[], n: number): Frame<CoinState>[] {
  const coins = [...new Set(coinsIn)].sort((a, b) => a - b);
  const frames: Frame<CoinState>[] = [];
  const taken: number[] = [];
  let rem = n;
  frames.push({
    state: { coins, coinRoles: {}, taken: [], remaining: rem },
    say: { en: `Greedy: always take the largest coin that still fits, until ${n} is made.`, hi: `Greedy: hamesha sabse bada coin lo jo abhi fit ho, jab tak ${n} na ban jaaye.` },
    vars: { remaining: rem },
  });
  for (let i = coins.length - 1; i >= 0; i--) {
    if (coins[i] > rem) continue;
    frames.push({ state: { coins, coinRoles: { [i]: 'compare' }, taken: taken.slice(), remaining: rem }, step: 'coin', say: { en: `Largest coin that fits ${rem}: ${coins[i]}.`, hi: `${rem} mein fit hone wala sabse bada coin: ${coins[i]}.` }, vars: { coin: coins[i], remaining: rem } });
    while (rem >= coins[i]) {
      rem -= coins[i];
      taken.push(coins[i]);
      frames.push({ state: { coins, coinRoles: { [i]: 'active' }, taken: taken.slice(), remaining: rem }, step: 'take', say: { en: `Take ${coins[i]}: ${rem} left.`, hi: `${coins[i]} lo: ${rem} bacha.` }, vars: { coin: coins[i], remaining: rem, coins: taken.length } });
    }
  }
  const opt = optimalCoins(coins, n);
  const ok = rem === 0;
  const same = ok && opt !== null && opt.length === taken.length;
  frames.push({
    state: { coins, coinRoles: {}, taken: taken.slice(), remaining: rem, optimal: opt ?? [] },
    step: 'done',
    say: !ok
      ? { en: `Greedy got stuck with ${rem} left. ${opt ? `Yet ${n} is possible: ${opt.join(' + ')}.` : `${n} cannot be made at all.`}`, hi: `Greedy ${rem} bache hue pe atak gaya. ${opt ? `Phir bhi ${n} ban sakta hai: ${opt.join(' + ')}.` : `${n} ban hi nahi sakta.`}` }
      : same
        ? { en: `Greedy used ${taken.length} coins, which is optimal here (dynamic programming agrees).`, hi: `Greedy ne ${taken.length} coins liye — yahan yahi optimal hai (dynamic programming bhi yahi kehta hai).` }
        : { en: `Greedy used ${taken.length} coins, but ${opt!.length} are enough: ${opt!.join(' + ')}. Taking the largest coin first is NOT always optimal.`, hi: `Greedy ne ${taken.length} coins liye, par ${opt!.length} kaafi hain: ${opt!.join(' + ')}. Sabse bada coin pehle lena hamesha optimal NAHI hota.` },
    vars: { greedy: ok ? taken.length : '—', optimal: opt ? opt.length : '—' },
  });
  return frames;
}

// ───────────── §6.2 scheduling (Scheduling.java: earliestEnd) ─────────────

export type Strategy = 'shortest' | 'earliestStart' | 'earliestEnd';
export interface Event { name: string; start: number; end: number }
export interface ScheduleState { items: Interval[]; chosen: number }

const overlaps = (a: Event, b: Event) => a.start < b.end && b.start < a.end;

export function maxEventsBrute(ev: Event[]): number {
  let best = 0;
  for (let m = 0; m < 1 << ev.length; m++) {
    const pick = ev.filter((_, i) => (m >> i) & 1);
    if (pick.every((a, i) => pick.every((b, j) => i === j || !overlaps(a, b)))) best = Math.max(best, pick.length);
  }
  return best;
}

export function traceSchedule(events: Event[], strategy: Strategy): Frame<ScheduleState>[] {
  const key = (e: Event) => (strategy === 'shortest' ? e.end - e.start : strategy === 'earliestStart' ? e.start : e.end);
  const order = events.map((e, i) => i).sort((a, b) => key(events[a]) - key(events[b]) || a - b);
  const status: (Role | undefined)[] = events.map(() => undefined);
  const items = (cur?: number, curRole?: Role): Interval[] =>
    events.map((e, i) => ({ id: String(i), start: e.start, end: e.end, label: e.name, role: i === cur ? curRole : status[i] }));
  const frames: Frame<ScheduleState>[] = [];
  const what = { shortest: { en: 'shortest event first', hi: 'sabse chhota event pehle' }, earliestStart: { en: 'earliest start first', hi: 'sabse pehle shuru hone wala' }, earliestEnd: { en: 'earliest END first', hi: 'sabse pehle KHATAM hone wala' } }[strategy];
  frames.push({ state: { items: items(), chosen: 0 }, say: { en: `Strategy: ${what.en}. Go through events in that order and take each one that doesn't overlap what we already took.`, hi: `Strategy: ${what.hi}. Is order mein events dekho aur har woh event lo jo pehle liye gaye events se overlap na kare.` } });
  let chosen = 0;
  const taken: Event[] = [];
  for (const i of order) {
    const e = events[i];
    const clash = taken.find((t) => overlaps(t, e));
    frames.push({ state: { items: items(i, 'compare'), chosen }, step: strategy === 'earliestEnd' ? 'consider' : undefined, say: { en: `Next: ${e.name} [${e.start}, ${e.end}].`, hi: `Agla: ${e.name} [${e.start}, ${e.end}].` }, vars: { event: e.name, chosen } });
    if (clash) {
      status[i] = 'muted';
      frames.push({ state: { items: items(), chosen }, say: { en: `${e.name} overlaps ${clash.name}: skip it.`, hi: `${e.name}, ${clash.name} se overlap karta hai: skip.` }, vars: { event: e.name, chosen } });
    } else {
      status[i] = 'done';
      taken.push(e);
      chosen++;
      frames.push({ state: { items: items(), chosen }, step: strategy === 'earliestEnd' ? 'take' : undefined, say: { en: `${e.name} fits: take it (${chosen} so far).`, hi: `${e.name} fit hota hai: le lo (ab tak ${chosen}).` }, vars: { event: e.name, chosen } });
    }
  }
  const best = maxEventsBrute(events);
  frames.push({
    state: { items: items(), chosen },
    step: strategy === 'earliestEnd' ? 'done' : undefined,
    say: chosen === best
      ? { en: `${chosen} events — the maximum possible here.`, hi: `${chosen} events — yahan ka maximum.` }
      : { en: `Only ${chosen}, but ${best} are possible: this strategy fails on this input.`, hi: `Sirf ${chosen}, jabki ${best} possible hain: is input pe yeh strategy fail.` },
    vars: { chosen, best },
  });
  return frames;
}

// ───────────── §6.3 tasks and deadlines (TasksDeadlines.java: score) ─────────────

export interface Task { name: string; duration: number; deadline: number }
export interface TaskState { order: Task[]; roles: Partial<Record<number, Role>>; total: number; points: (number | null)[] }

export const scoreOf = (order: Task[]) => {
  let t = 0;
  return order.reduce((s, k) => ((t += k.duration), s + k.deadline - t), 0);
};

const timeline = (order: Task[]) => {
  let t = 0;
  return order.map((k) => ({ start: t, end: (t += k.duration) }));
};
export const taskItems = (order: Task[], roles: Partial<Record<number, Role>>, points?: (number | null)[]): Interval[] =>
  timeline(order).map((iv, i) => ({ id: order[i].name, start: iv.start, end: iv.end, label: order[i].name, role: roles[i], note: points?.[i] != null ? `${points[i]! >= 0 ? '+' : ''}${points[i]}` : `d=${order[i].deadline}` }));

export function traceTasks(tasks: Task[]): Frame<TaskState>[] {
  const order = tasks.slice();
  const frames: Frame<TaskState>[] = [{
    state: { order: order.slice(), roles: {}, total: scoreOf(order), points: [] },
    say: { en: `In this order the total is ${scoreOf(order)}. Exchange argument: whenever a longer task is directly before a shorter one, swap them.`, hi: `Is order mein total ${scoreOf(order)} hai. Exchange argument: jab bhi lamba task chhote se theek pehle ho, dono ko swap karo.` },
    vars: { total: scoreOf(order) },
  }];
  for (let pass = 0; pass < order.length; pass++) {
    for (let i = 0; i + 1 < order.length; i++) {
      const a = order[i], b = order[i + 1];
      if (a.duration > b.duration) {
        const before = scoreOf(order);
        order[i] = b; order[i + 1] = a;
        frames.push({
          state: { order: order.slice(), roles: { [i]: 'changed', [i + 1]: 'changed' }, total: scoreOf(order), points: [] },
          say: { en: `${a.name} (${a.duration}) was before shorter ${b.name} (${b.duration}): swap. ${b.name} finishes ${a.duration} earlier, ${a.name} ${b.duration} later, so the total gains ${a.duration} − ${b.duration} = ${a.duration - b.duration}: ${before} → ${scoreOf(order)}.`, hi: `${a.name} (${a.duration}) chhote ${b.name} (${b.duration}) se pehle tha: swap. ${b.name} ${a.duration} pehle khatam, ${a.name} ${b.duration} baad — total mein ${a.duration} − ${b.duration} = ${a.duration - b.duration} ka fayda: ${before} → ${scoreOf(order)}.` },
          vars: { total: scoreOf(order) },
        });
      }
    }
  }
  // Now score the sorted order exactly like the Java code.
  let time = 0, total = 0;
  const points: (number | null)[] = order.map(() => null);
  order.forEach((k, i) => {
    time += k.duration;
    total += k.deadline - time;
    points[i] = k.deadline - time;
    frames.push({
      state: { order: order.slice(), roles: { [i]: 'active' }, total, points: points.slice() },
      step: ['run', 'score'],
      say: { en: `${k.name} finishes at ${time}: earns ${k.deadline} − ${time} = ${k.deadline - time}. Running total ${total}.`, hi: `${k.name} ${time} pe khatam: ${k.deadline} − ${time} = ${k.deadline - time} points. Total ${total}.` },
      vars: { time, total },
    });
  });
  frames.push({
    state: { order: order.slice(), roles: Object.fromEntries(order.map((_, i) => [i, 'done' as Role])), total, points: points.slice() },
    say: { en: `Shortest-first gives ${total}, the best possible. Notice that the deadlines never influenced the order.`, hi: `Shortest-first se ${total} — sabse best. Dhyaan do: deadlines ne order pe koi asar hi nahi daala.` },
    vars: { total },
  });
  return frames;
}

// ───────────── §6.5 Huffman (Huffman.java: build) ─────────────

export interface HNode { id: number; weight: number; ch?: string; left?: HNode; right?: HNode }
export interface HuffState { forest: BTNode[]; roles: Record<number, Role>; codes?: [string, string][]; bits?: number }

const toBT = (n: HNode, edge?: string): BTNode => ({
  id: n.id, label: String(n.weight), sub: n.ch, edge,
  children: n.left ? [toBT(n.left, '0'), toBT(n.right!, '1')] : undefined,
});

export function huffmanCodes(root: HNode): Map<string, string> {
  const out = new Map<string, string>();
  const go = (n: HNode, p: string) => {
    if (!n.left) { out.set(n.ch!, p || '0'); return; }
    go(n.left, p + '0');
    go(n.right!, p + '1');
  };
  go(root, '');
  return out;
}

export function traceHuffman(s: string): Frame<HuffState>[] {
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  let id = 0;
  const pool: HNode[] = [];
  for (const c of s) if (freq.has(c)) { pool.push({ id: id++, weight: freq.get(c)!, ch: c }); freq.delete(c); }
  const frames: Frame<HuffState>[] = [];
  const cmp = (a: HNode, b: HNode) => a.weight - b.weight || a.id - b.id;
  const forest = () => pool.slice().sort(cmp).map((n) => toBT(n));
  frames.push({
    state: { forest: forest(), roles: {} },
    step: 'leaf',
    say: { en: `One node per character, weighted by how often it appears in "${s}".`, hi: `Har character ka ek node, weight = "${s}" mein woh kitni baar aata hai.` },
  });
  while (pool.length > 1) {
    pool.sort(cmp);
    const x = pool.shift()!, y = pool.shift()!;
    frames.push({
      state: { forest: [x, y, ...pool].sort(cmp).map((n) => toBT(n)), roles: { [x.id]: 'compare', [y.id]: 'compare' } },
      step: 'pick',
      say: { en: `The two lightest trees: ${x.weight}${x.ch ? ` (${x.ch})` : ''} and ${y.weight}${y.ch ? ` (${y.ch})` : ''}.`, hi: `Do sabse halke trees: ${x.weight}${x.ch ? ` (${x.ch})` : ''} aur ${y.weight}${y.ch ? ` (${y.ch})` : ''}.` },
    });
    const l = x.weight === y.weight ? x : y, r = l === x ? y : x;
    const parent: HNode = { id: id++, weight: x.weight + y.weight, left: l, right: r };
    pool.push(parent);
    frames.push({
      state: { forest: forest(), roles: { [parent.id]: 'changed' } },
      step: 'merge',
      say: { en: `Merge them under a new node of weight ${parent.weight}. Left edge = 0, right edge = 1.`, hi: `Inhe ${parent.weight} weight wale naye node ke neeche jodo. Left edge = 0, right edge = 1.` },
    });
  }
  const codes = huffmanCodes(pool[0]);
  const bits = [...s].reduce((t, c) => t + codes.get(c)!.length, 0);
  const fixed = s.length * Math.max(1, Math.ceil(Math.log2(codes.size)));
  frames.push({
    state: { forest: forest(), roles: {}, codes: [...codes.entries()].sort((a, b) => a[1].length - b[1].length || a[0].localeCompare(b[0])), bits },
    say: { en: `Read each codeword along the path from the root. "${s}" now takes ${bits} bits instead of ${fixed} with fixed-length codes.`, hi: `Har codeword root se path pe padho. "${s}" ab ${bits} bits leta hai, fixed-length codes ke ${fixed} ki jagah.` },
    vars: { bits, fixed },
  });
  return frames;
}
