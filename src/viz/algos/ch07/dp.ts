import type { Frame, Role } from '../../engine/types';
import type { Region } from '../../views/GridView';

const INF = Infinity;
const show = (v: number) => (v === INF ? '∞' : v);

// ───────────── §7.1 coins (CoinDP.java: iterative, count) ─────────────

export interface CoinDPState {
  values: (number | string | null)[];
  roles: Partial<Record<number, Role>>;
  first?: (number | null)[];
  solution?: number[];
}

export function traceMinCoins(coins: number[], n: number): Frame<CoinDPState>[] {
  const best: number[] = [0, ...Array(n).fill(INF)];
  const first: (number | null)[] = Array(n + 1).fill(null);
  const vals = (upTo: number) => best.map((v, i) => (i <= upTo ? show(v) : null));
  const frames: Frame<CoinDPState>[] = [{
    state: { values: vals(0), roles: { 0: 'done' }, first: first.slice() },
    say: { en: `value[x] = fewest coins for sum x. value[0] = 0. Fill x = 1..${n} in order, so smaller sums are always ready.`, hi: `value[x] = sum x ke liye kam se kam coins. value[0] = 0. x = 1..${n} order mein bharo — chhote sums hamesha pehle se ready.` },
  }];
  for (let x = 1; x <= n; x++) {
    for (const c of coins) {
      if (x - c < 0) continue;
      const cand = best[x - c] + 1;
      const better = cand < best[x];
      const prev = best[x];
      if (better) { best[x] = cand; first[x] = c; }
      frames.push({
        state: { values: vals(x), roles: { [x]: better ? 'changed' : 'active', [x - c]: 'compare' }, first: first.slice() },
        step: better ? ['coin', 'better'] : 'coin',
        say: better
          ? { en: `x = ${x}, first coin ${c}: value[${x - c}] + 1 = ${show(cand)} beats ${show(prev)}. value[${x}] = ${show(cand)}, first[${x}] = ${c}.`, hi: `x = ${x}, pehla coin ${c}: value[${x - c}] + 1 = ${show(cand)}, ${show(prev)} se behtar. value[${x}] = ${show(cand)}, first[${x}] = ${c}.` }
          : { en: `x = ${x}, first coin ${c}: value[${x - c}] + 1 = ${show(cand)}, not better than ${show(best[x])}.`, hi: `x = ${x}, pehla coin ${c}: value[${x - c}] + 1 = ${show(cand)} — ${show(best[x])} se behtar nahi.` },
        vars: { x, c, 'value[x]': show(best[x]) },
      });
    }
  }
  const sol: number[] = [];
  const path: Partial<Record<number, Role>> = {};
  if (best[n] !== INF) for (let x = n; x > 0; x -= first[x]!) { sol.push(first[x]!); path[x] = 'path'; }
  path[0] = 'path';
  frames.push({
    state: { values: vals(n), roles: path, first: first.slice(), solution: sol },
    step: 'done',
    say: best[n] === INF
      ? { en: `value[${n}] = ∞: the sum ${n} can't be made from these coins.`, hi: `value[${n}] = ∞: in coins se ${n} ban hi nahi sakta.` }
      : { en: `value[${n}] = ${best[n]}. Follow first[]: ${sol.join(' + ')} = ${n}. Time O(n·k).`, hi: `value[${n}] = ${best[n]}. first[] follow karo: ${sol.join(' + ')} = ${n}. Time O(n·k).` },
    vars: { answer: show(best[n]) },
  });
  return frames;
}

export function traceWays(coins: number[], n: number): Frame<CoinDPState>[] {
  const count: number[] = [1, ...Array(n).fill(0)];
  const vals = (upTo: number) => count.map((v, i) => (i <= upTo ? v : null));
  const frames: Frame<CoinDPState>[] = [{
    state: { values: vals(0), roles: { 0: 'done' } },
    say: { en: `count[x] = number of ordered ways to make x. count[0] = 1 (the empty sum). Then count[x] = Σ count[x − c].`, hi: `count[x] = x banane ke ordered tareeke. count[0] = 1 (khaali sum). Phir count[x] = Σ count[x − c].` },
  }];
  for (let x = 1; x <= n; x++) {
    for (const c of coins) {
      if (x - c < 0) continue;
      count[x] += count[x - c];
      frames.push({
        state: { values: vals(x), roles: { [x]: 'changed', [x - c]: 'compare' } },
        step: 'add',
        say: { en: `x = ${x}: sequences ending with coin ${c} = count[${x - c}] = ${count[x - c]}. count[${x}] is now ${count[x]}.`, hi: `x = ${x}: coin ${c} pe khatam hone wale = count[${x - c}] = ${count[x - c]}. count[${x}] ab ${count[x]}.` },
        vars: { x, c, 'count[x]': count[x] },
      });
    }
  }
  frames.push({ state: { values: vals(n), roles: { [n]: 'done' } }, step: 'done', say: { en: `${count[n]} ordered ways to make ${n}. Real problems ask for this modulo 10⁹+7.`, hi: `${n} banane ke ${count[n]} ordered tareeke. Asli problems mein yeh modulo 10⁹+7 maangte hain.` }, vars: { answer: count[n] } });
  return frames;
}

// ───────────── §7.2 LIS (LIS.java: quadratic) ─────────────

export interface LisState { a: number[]; len: (number | null)[]; roles: Partial<Record<number, Role>>; lenRoles: Partial<Record<number, Role>> }

export function traceLIS(a: number[]): Frame<LisState>[] {
  const n = a.length;
  const len: (number | null)[] = Array(n).fill(null);
  const parent: number[] = Array(n).fill(-1);
  const frames: Frame<LisState>[] = [{
    state: { a, len: len.slice(), roles: {}, lenRoles: {} },
    say: { en: `length[k] = longest increasing subsequence ending exactly at k. For each k, look at every earlier i with a[i] < a[k].`, hi: `length[k] = k pe hi khatam hone wala sabse lamba increasing subsequence. Har k ke liye har pichhla i dekho jahan a[i] < a[k].` },
  }];
  for (let k = 0; k < n; k++) {
    len[k] = 1;
    frames.push({ state: { a, len: len.slice(), roles: { [k]: 'active' }, lenRoles: { [k]: 'changed' } }, step: 'start', say: { en: `k = ${k} (a[k] = ${a[k]}): on its own it's a subsequence of length 1.`, hi: `k = ${k} (a[k] = ${a[k]}): akela bhi length 1 ka subsequence hai.` }, vars: { k, 'length[k]': 1 } });
    for (let i = 0; i < k; i++) {
      const ok = a[i] < a[k];
      const better = ok && (len[i] as number) + 1 > (len[k] as number);
      if (better) { len[k] = (len[i] as number) + 1; parent[k] = i; }
      frames.push({
        state: { a, len: len.slice(), roles: { [k]: 'active', [i]: ok ? 'compare' : 'muted' }, lenRoles: { [k]: better ? 'changed' : 'active', [i]: 'compare' } },
        step: ok ? (better ? ['compare', 'extend'] : 'compare') : 'compare',
        say: !ok
          ? { en: `a[${i}] = ${a[i]} ≥ ${a[k]}: can't come before a[${k}].`, hi: `a[${i}] = ${a[i]} ≥ ${a[k]}: a[${k}] se pehle nahi aa sakta.` }
          : better
            ? { en: `a[${i}] = ${a[i]} < ${a[k]}: extend its subsequence: length[${k}] = length[${i}] + 1 = ${len[k]}.`, hi: `a[${i}] = ${a[i]} < ${a[k]}: uska subsequence aage badhao: length[${k}] = length[${i}] + 1 = ${len[k]}.` }
            : { en: `a[${i}] = ${a[i]} < ${a[k]}, but length[${i}] + 1 = ${(len[i] as number) + 1} is no improvement.`, hi: `a[${i}] = ${a[i]} < ${a[k]}, par length[${i}] + 1 = ${(len[i] as number) + 1} se kuch behtar nahi.` },
        vars: { k, i, 'length[k]': len[k] as number },
      });
    }
  }
  const best = Math.max(0, ...(len as number[]));
  let end = (len as number[]).indexOf(best);
  const chain: Partial<Record<number, Role>> = {};
  while (end >= 0) { chain[end] = 'done'; end = parent[end]; }
  frames.push({ state: { a, len: len.slice(), roles: chain, lenRoles: chain }, say: { en: `The answer is max length[k] = ${best}. Following the "came from" links gives one such subsequence. O(n²).`, hi: `Answer = max length[k] = ${best}. "Kahan se aaya" links follow karo — ek aisa subsequence mil jaata hai. O(n²).` }, vars: { answer: best } });
  return frames;
}

// ───────────── §7.3 paths in a grid (GridPathSum.java: maxsum) ─────────────

export interface GridState { value: number[][]; sum: (number | null)[][]; vRoles: Record<string, Role>; sRoles: Record<string, Role> }

export function traceGridSum(value: number[][]): Frame<GridState>[] {
  const n = value.length, m = value[0].length;
  const sum: (number | null)[][] = value.map((r) => r.map(() => null));
  const at = (y: number, x: number) => (y < 0 || x < 0 ? 0 : (sum[y][x] as number));
  const frames: Frame<GridState>[] = [{ state: { value, sum: sum.map((r) => r.slice()), vRoles: {}, sRoles: {} }, say: { en: `sum(y, x) = the best path sum ending at (y, x). A path can only arrive from the left or from above.`, hi: `sum(y, x) = (y, x) pe khatam hone wale path ka best sum. Path sirf left se ya upar se aa sakta hai.` } }];
  for (let y = 0; y < n; y++) for (let x = 0; x < m; x++) {
    const left = at(y, x - 1), up = at(y - 1, x);
    sum[y][x] = Math.max(left, up) + value[y][x];
    const from = x > 0 && (y === 0 || left >= up) ? `${y},${x - 1}` : y > 0 ? `${y - 1},${x}` : null;
    frames.push({
      state: { value, sum: sum.map((r) => r.slice()), vRoles: { [`${y},${x}`]: 'active' }, sRoles: { [`${y},${x}`]: 'changed', ...(from ? { [from]: 'compare' } : {}) } },
      step: 'cell',
      say: { en: `sum(${y + 1}, ${x + 1}) = max(left ${left}, up ${up}) + ${value[y][x]} = ${sum[y][x]}.`, hi: `sum(${y + 1}, ${x + 1}) = max(left ${left}, upar ${up}) + ${value[y][x]} = ${sum[y][x]}.` },
      vars: { y: y + 1, x: x + 1, sum: sum[y][x] as number },
    });
  }
  const path: Record<string, Role> = {};
  let y = n - 1, x = m - 1;
  while (y >= 0 && x >= 0) {
    path[`${y},${x}`] = 'path';
    if (y === 0) x--; else if (x === 0) y--; else if ((sum[y][x - 1] as number) >= (sum[y - 1][x] as number)) x--; else y--;
  }
  frames.push({ state: { value, sum, vRoles: path, sRoles: path }, say: { en: `The best sum is ${sum[n - 1][m - 1]}. Walking back from the corner, always to the larger neighbour, recovers the path. O(n²).`, hi: `Best sum ${sum[n - 1][m - 1]}. Corner se peeche chalo, hamesha bade padosi ki taraf — path mil jaata hai. O(n²).` }, vars: { answer: sum[n - 1][m - 1] as number } });
  return frames;
}

// ───────────── §7.4 knapsack (Knapsack.java: table) ─────────────

export interface KnapState { table: (string | null)[][]; roles: Record<string, Role>; weights: number[] }

export function traceKnapsack(w: number[]): Frame<KnapState>[] {
  const n = w.length, W = w.reduce((s, v) => s + v, 0);
  const possible: boolean[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(false));
  possible[0][0] = true;
  const table = (upToK: number, upToX = W): (string | null)[][] =>
    possible.map((row, k) => row.map((v, x) => (k < upToK || (k === upToK && x <= upToX) ? (v ? '✓' : '·') : null)));
  const frames: Frame<KnapState>[] = [{ state: { table: table(0), roles: { '0,0': 'done' }, weights: w }, say: { en: `possible[k][x]: can the first k weights make the sum x? With no weights, only 0 is possible.`, hi: `possible[k][x]: kya pehle k weights se sum x ban sakta hai? Koi weight nahi toh sirf 0.` } }];
  for (let k = 1; k <= n; k++) {
    for (let x = 0; x <= W; x++) {
      const use = x - w[k - 1] >= 0 && possible[k - 1][x - w[k - 1]];
      const skip = possible[k - 1][x];
      possible[k][x] = use || skip;
      if (!use && !skip) continue; // only narrate the cells that become true
      frames.push({
        state: { table: table(k, x), roles: { [`${k},${x}`]: 'changed', ...(use ? { [`${k - 1},${x - w[k - 1]}`]: 'compare' } : {}), ...(skip ? { [`${k - 1},${x}`]: 'range' } : {}) }, weights: w },
        step: use ? 'use' : 'skip',
        say: use
          ? { en: `possible[${k}][${x}]: use weight ${w[k - 1]}, since sum ${x - w[k - 1]} was possible with the first ${k - 1}.`, hi: `possible[${k}][${x}]: weight ${w[k - 1]} use karo — pehle ${k - 1} se sum ${x - w[k - 1]} ban sakta tha.` }
          : { en: `possible[${k}][${x}]: skip weight ${w[k - 1]}, since ${x} was already possible.`, hi: `possible[${k}][${x}]: weight ${w[k - 1]} chhodo — ${x} pehle se ban sakta tha.` },
        vars: { k, x, w: w[k - 1] },
      });
    }
  }
  const missing = possible[n].map((v, x) => (v ? -1 : x)).filter((x) => x >= 0);
  frames.push({ state: { table: table(n), roles: Object.fromEntries(possible[n].map((v, x) => [`${n},${x}`, v ? ('done' as Role) : ('muted' as Role)])), weights: w }, say: { en: `Row ${n} answers it: every sum 0..${W}${missing.length ? ` except ${missing.join(', ')}` : ''} is possible. O(nW).`, hi: `Row ${n} jawab deti hai: 0..${W} ka har sum${missing.length ? `, ${missing.join(', ')} ko chhodkar,` : ''} ban sakta hai. O(nW).` } });
  return frames;
}

// ───────────── §7.5 edit distance (EditDistance.java: distance) ─────────────

export interface EditState { table: (number | null)[][]; roles: Record<string, Role>; x: string; y: string; ops?: string[] }

export function traceEdit(x: string, y: string): Frame<EditState>[] {
  const n = x.length, m = y.length;
  const d: (number | null)[][] = Array.from({ length: n + 1 }, (_, a) => Array.from({ length: m + 1 }, (_, b) => (a === 0 ? b : b === 0 ? a : null)));
  const snap = () => d.map((r) => r.slice());
  const frames: Frame<EditState>[] = [{ state: { table: snap(), roles: {}, x, y }, say: { en: `d[a][b] = edit distance between the first a letters of ${x} and the first b of ${y}. The first row and column are inserts and removes.`, hi: `d[a][b] = ${x} ke pehle a letters aur ${y} ke pehle b letters ka edit distance. Pehli row/column = inserts aur removes.` } }];
  for (let a = 1; a <= n; a++) for (let b = 1; b <= m; b++) {
    const cost = x[a - 1] === y[b - 1] ? 0 : 1;
    const ins = (d[a][b - 1] as number) + 1, del = (d[a - 1][b] as number) + 1, mod = (d[a - 1][b - 1] as number) + cost;
    d[a][b] = Math.min(ins, del, mod);
    frames.push({
      state: { table: snap(), roles: { [`${a},${b}`]: 'changed', [`${a},${b - 1}`]: 'compare', [`${a - 1},${b}`]: 'compare', [`${a - 1},${b - 1}`]: cost ? 'compare' : 'done' }, x, y },
      step: 'cell',
      say: { en: `${x.slice(0, a)} → ${y.slice(0, b)}: min(insert ${ins}, remove ${del}, ${cost ? `modify ${mod}` : `match ${mod}`}) = ${d[a][b]}.`, hi: `${x.slice(0, a)} → ${y.slice(0, b)}: min(insert ${ins}, remove ${del}, ${cost ? `modify ${mod}` : `match ${mod}`}) = ${d[a][b]}.` },
      vars: { a, b, cost, 'd[a][b]': d[a][b] as number },
    });
  }
  // Trace back one optimal sequence of operations.
  const ops: string[] = [];
  const path: Record<string, Role> = {};
  let a = n, b = m;
  while (a > 0 || b > 0) {
    path[`${a},${b}`] = 'path';
    const v = d[a][b] as number;
    if (a > 0 && b > 0 && v === (d[a - 1][b - 1] as number) + (x[a - 1] === y[b - 1] ? 0 : 1)) {
      if (x[a - 1] !== y[b - 1]) ops.push(`modify ${x[a - 1]}→${y[b - 1]}`);
      a--; b--;
    } else if (b > 0 && v === (d[a][b - 1] as number) + 1) { ops.push(`insert ${y[b - 1]}`); b--; }
    else { ops.push(`remove ${x[a - 1]}`); a--; }
  }
  path['0,0'] = 'path';
  frames.push({ state: { table: snap(), roles: path, x, y, ops: ops.reverse() }, say: { en: `Edit distance = ${d[n][m]}${ops.length ? `: ${ops.join(', ')}` : ''}. Walk back from the corner to read the operations. O(nm).`, hi: `Edit distance = ${d[n][m]}${ops.length ? `: ${ops.join(', ')}` : ''}. Corner se peeche chalo aur operations padho. O(nm).` }, vars: { answer: d[n][m] as number } });
  return frames;
}

// ───────────── §7.6 counting tilings (Tilings.java: dp) ─────────────

export interface TilingState { counts: (number | null)[][]; roles: Record<string, Role>; masks: string[] }

export function traceTilings(n: number, m: number): Frame<TilingState>[] {
  const M = 1 << m;
  const count: number[][] = Array.from({ length: n + 1 }, () => Array(M).fill(0));
  count[0][0] = 1;
  const masks = Array.from({ length: M }, (_, k) => Array.from({ length: m }, (_, c) => ((k >> c) & 1 ? '▾' : '·')).join(''));
  const table = (upTo: number) => Array.from({ length: M }, (_, k) => Array.from({ length: n + 1 }, (_, r) => (r <= upTo ? count[r][k] || null : null)));
  const frames: Frame<TilingState>[] = [{ state: { counts: table(0), roles: { '0,0': 'done' }, masks }, say: { en: `Column r is the boundary above row r. A mask marks (▾) the columns already covered by a vertical tile sticking down from the row above.`, hi: `Column r = row r ke upar ki boundary. Mask un columns ko (▾) mark karta hai jo upar wali row se neeche aate vertical tile se pehle hi dhake hain.` } }];
  const fill = (row: number, mask: number, col: number, next: number, out: number[]) => {
    if (col === m) { out.push(next); return; }
    if ((mask >> col) & 1) { fill(row, mask, col + 1, next, out); return; }
    fill(row, mask, col + 1, next | (1 << col), out);
    if (col + 1 < m && !((mask >> (col + 1)) & 1)) fill(row, mask, col + 2, next, out);
  };
  for (let row = 0; row < n; row++) {
    for (let mask = 0; mask < M; mask++) {
      if (!count[row][mask]) continue;
      const outs: number[] = [];
      fill(row, mask, 0, 0, outs);
      for (const nx of outs) count[row + 1][nx] += count[row][mask];
      frames.push({
        state: { counts: table(row + 1), roles: { [`${mask},${row}`]: 'active', ...Object.fromEntries(outs.map((nx) => [`${nx},${row + 1}`, 'changed' as Role])) }, masks },
        step: ['row', 'add'],
        say: { en: `Row ${row + 1} with state ${masks[mask]} (${count[row][mask]} ways so far) can be filled in ${outs.length} way${outs.length === 1 ? '' : 's'}. Each adds ${count[row][mask]} to the matching state below.`, hi: `Row ${row + 1}, state ${masks[mask]} (ab tak ${count[row][mask]} tareeke): ${outs.length} tarah se bhar sakte hain — har ek neeche wale matching state mein ${count[row][mask]} jodta hai.` },
        vars: { row: row + 1, ways: count[row][mask] },
      });
    }
  }
  frames.push({ state: { counts: table(n), roles: { [`0,${n}`]: 'done' }, masks }, step: 'done', say: { en: `Below the last row nothing may stick out, so the answer is count[${n}][${masks[0]}] = ${count[n][0]}. O(n · 4^m) in the worst case: keep m (the columns) small.`, hi: `Aakhri row ke neeche kuch bahar nahi nikal sakta, toh answer count[${n}][${masks[0]}] = ${count[n][0]}. Worst case O(n · 4^m) — m (columns) chhota rakho.` }, vars: { answer: count[n][0] } });
  return frames;
}

/** One example tiling (for drawing): list of dominoes as [r1, c1, r2, c2]. */
export function sampleTiling(n: number, m: number, which = 0): number[][] | null {
  const g = Array.from({ length: n }, () => Array(m).fill(false));
  const tiles: number[][] = [];
  let seen = 0;
  let result: number[][] | null = null;
  const go = (cell: number): boolean => {
    if (cell === n * m) { if (seen++ === which) { result = tiles.map((t) => t.slice()); return true; } return false; }
    const r = Math.floor(cell / m), c = cell % m;
    if (g[r][c]) return go(cell + 1);
    g[r][c] = true;
    if (c + 1 < m && !g[r][c + 1]) { g[r][c + 1] = true; tiles.push([r, c, r, c + 1]); if (go(cell + 1)) return true; tiles.pop(); g[r][c + 1] = false; }
    if (r + 1 < n && !g[r + 1][c]) { g[r + 1][c] = true; tiles.push([r, c, r + 1, c]); if (go(cell + 1)) return true; tiles.pop(); g[r + 1][c] = false; }
    g[r][c] = false;
    return false;
  };
  go(0);
  return result;
}
