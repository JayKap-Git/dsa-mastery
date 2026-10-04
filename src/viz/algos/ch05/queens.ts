import type { Frame, Role } from '../../engine/types';

// Mirrors NQueens.java (region: backtrack).

export interface QueensState {
  board: (string | null)[][];
  roles: Record<string, Role>;
  solutions: number;
}

export const KNOWN_Q = [1, 1, 0, 0, 2, 10, 4, 40, 92];

export function traceQueens(n: number, maxFrames = 4000): Frame<QueensState>[] {
  const frames: Frame<QueensState>[] = [];
  const col = Array(n).fill(false), d1 = Array(2 * n).fill(false), d2 = Array(2 * n).fill(false);
  const qx: number[] = []; // queen column per row
  let count = 0;
  const attacked = (r: number, c: number) => qx.some((x, y) => x === c || x + y === c + r || x - y === c - r);
  const snap = (extra: Record<string, Role> = {}): QueensState => {
    const board = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (qx[r] === c ? '♛' : null)));
    const roles: Record<string, Role> = {};
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qx[r] === c) roles[`${r},${c}`] = 'done';
      else if (r >= qx.length && attacked(r, c)) roles[`${r},${c}`] = 'muted';
    }
    return { board, roles: { ...roles, ...extra }, solutions: count };
  };
  frames.push({ state: snap(), say: { en: `Place one queen per row, top to bottom. Grey squares are attacked by the queens already placed.`, hi: `Har row mein ek queen, upar se neeche. Grey squares pe pehle se rakhi queens ka attack hai.` } });

  const rec = (y: number) => {
    if (frames.length > maxFrames) return;
    if (y === n) {
      count++;
      frames.push({ state: snap(), step: 'solution', say: { en: `All ${n} queens placed: solution #${count}!`, hi: `Saari ${n} queens rakh di: solution #${count}!` }, vars: { y, solutions: count } });
      return;
    }
    for (let x = 0; x < n; x++) {
      if (col[x] || d1[x + y] || d2[x - y + n - 1]) {
        frames.push({ state: snap({ [`${y},${x}`]: 'minus' }), step: 'blocked', say: { en: `Row ${y}, column ${x}: attacked (column or diagonal taken). Skip.`, hi: `Row ${y}, column ${x}: attack mein hai (column ya diagonal bhara). Skip.` }, vars: { y, x, solutions: count } });
        continue;
      }
      col[x] = d1[x + y] = d2[x - y + n - 1] = true;
      qx.push(x);
      frames.push({ state: snap({ [`${y},${x}`]: 'active' }), step: 'place', say: { en: `Row ${y}, column ${x} is safe: place a queen and go to row ${y + 1}.`, hi: `Row ${y}, column ${x} safe hai: queen rakho aur row ${y + 1} pe jao.` }, vars: { y, x, solutions: count } });
      rec(y + 1);
      qx.pop();
      col[x] = d1[x + y] = d2[x - y + n - 1] = false;
      frames.push({ state: snap({ [`${y},${x}`]: 'changed' }), step: 'remove', say: { en: `Backtrack: remove the queen from row ${y}, column ${x} and try further right.`, hi: `Backtrack: row ${y}, column ${x} se queen hatao aur aage right try karo.` }, vars: { y, x, solutions: count } });
    }
  };
  rec(0);
  frames.push({ state: snap(), say: { en: `Search finished: q(${n}) = ${count}.`, hi: `Search khatam: q(${n}) = ${count}.` }, vars: { solutions: count } });
  return frames;
}
