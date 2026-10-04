import type { Role } from '../engine/types';

export interface FenwickBarsProps {
  /** 1-indexed tree values: tree[1..n]. Index 0 unused. */
  tree: number[];
  n: number;
  roles?: Partial<Record<number, Role>>;
}

const COL = 44;
const ROW = 30;

/**
 * Draws tree[k] as a bar spanning [k - p(k) + 1, k], stacked by the size of p(k),
 * like the book's picture of a binary indexed tree.
 */
export function FenwickBars({ tree, n, roles = {} }: FenwickBarsProps) {
  const levels = Math.floor(Math.log2(n)) + 1;
  const W = n * COL;
  const H = 22 + levels * ROW;

  const bars = [];
  for (let k = 1; k <= n; k++) {
    const p = k & -k;
    const level = Math.log2(p);
    const x = (k - p) * COL + 3;
    const y = 22 + (levels - 1 - level) * ROW + 3;
    const w = p * COL - 6;
    const role = roles[k];
    bars.push(
      <g key={k} className={`fbar${role ? ` role-${role}` : ''}`}>
        <rect x={x} y={y} width={w} height={ROW - 6} rx={6} />
        {p === 1 ? (
          <text x={x + w / 2} y={y + (ROW - 6) / 2} dy="0.35em" textAnchor="middle" className="fval">{tree[k]}</text>
        ) : (
          <>
            <text x={x + 8} y={y + (ROW - 6) / 2} dy="0.35em" className="fk">tree[{k}]</text>
            <text x={x + w - 8} y={y + (ROW - 6) / 2} dy="0.35em" textAnchor="end" className="fval">{tree[k]}</text>
          </>
        )}
      </g>,
    );
  }

  return (
    <div className="arr-scroll">
      <svg className="fenwick-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="binary indexed tree ranges">
        {Array.from({ length: n }, (_, i) => (
          <text key={i} x={i * COL + COL / 2} y={14} className="fhead" textAnchor="middle">{i + 1}</text>
        ))}
        {bars}
      </svg>
    </div>
  );
}
