// Mirrors GridPaths.java: paths from the upper-left to the lower-right corner visiting every square once.
// Level 0 = basic, 1 = symmetry, 2 = stop at the corner, 3 = wall split, 4 = any split.

const DR = [1, 0, -1, 0], DC = [0, 1, 0, -1];

export function countPaths(n: number, level: number): { paths: number; calls: number } {
  if (n === 1) return { paths: 1, calls: 1 };
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  let paths = 0, calls = 0;
  const free = (r: number, c: number) => r >= 0 && c >= 0 && r < n && c < n && !seen[r][c];
  const search = (r: number, c: number, visited: number, dir: number) => {
    calls++;
    if (r === n - 1 && c === n - 1) {
      if (visited === n * n) { paths++; return; }
      if (level >= 2) return;
    }
    if (level >= 3 && dir >= 0) {
      const ar = r + DR[dir], ac = c + DC[dir];
      const wallAhead = ar < 0 || ac < 0 || ar >= n || ac >= n;
      if (level >= 4 ? !free(ar, ac) : wallAhead) {
        const lf = (dir + 1) % 4, rt = (dir + 3) % 4;
        if (free(r + DR[lf], c + DC[lf]) && free(r + DR[rt], c + DC[rt])) return;
      }
    }
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d], nc = c + DC[d];
      if (!free(nr, nc)) continue;
      seen[nr][nc] = true;
      search(nr, nc, visited + 1, d);
      seen[nr][nc] = false;
    }
  };
  seen[0][0] = true;
  if (level >= 1) {
    seen[1][0] = true;
    search(1, 0, 2, 0);
    return { paths: 2 * paths, calls };
  }
  search(0, 0, 1, -1);
  return { paths, calls };
}

/** The book's measurements for 7×7 (C++). */
export const BOOK_7x7 = [
  { level: 0, seconds: 483, calls: 76e9 },
  { level: 1, seconds: 244, calls: 38e9 },
  { level: 2, seconds: 119, calls: 20e9 },
  { level: 3, seconds: 1.8, calls: 221e6 },
  { level: 4, seconds: 0.6, calls: 69e6 },
];

export const LEVELS = [
  { en: 'Basic backtracking', hi: 'Basic backtracking' },
  { en: '+ symmetry: first step down only, ×2', hi: '+ symmetry: pehla step sirf neeche, ×2' },
  { en: '+ stop on reaching the corner too early', hi: '+ corner pe jaldi pahunche toh ruko' },
  { en: '+ wall ahead, both sides free → split', hi: '+ aage wall, dono sides free → split' },
  { en: '+ anything ahead, both sides free → split', hi: '+ aage kuch bhi, dono sides free → split' },
];
