import type { Role } from '../engine/types';

export interface HeapTreeViewProps {
  /** Heap-indexed values: tree[1] is the root, children of k are 2k and 2k+1. Index 0 is unused. */
  tree: (number | string | null)[];
  /** Number of leaves (a power of two). Leaves are tree[n .. 2n-1]. */
  n: number;
  roles?: Partial<Record<number, Role>>;
  /** Show each node's heap index (tree[k]) above it. */
  showIndex?: boolean;
  /** Label under each leaf, e.g. the array index it stores. */
  leafLabel?: (i: number) => string | number;
  /** Small badges next to nodes, e.g. pointer names "a", "b". */
  badges?: Partial<Record<number, string>>;
}

const LEVEL_H = 66;
const NODE_W = 42;
const NODE_H = 28;
const SLOT = 54;

/** A perfect binary tree stored heap-style (segment trees, heaps). */
export function HeapTreeView({ tree, n, roles = {}, showIndex = true, leafLabel, badges = {} }: HeapTreeViewProps) {
  const levels = Math.round(Math.log2(n)) + 1;
  const W = n * SLOT;
  const H = levels * LEVEL_H + (leafLabel ? 14 : 0);

  const pos = (k: number) => {
    const level = Math.floor(Math.log2(k));
    const first = 1 << level;
    const count = first;
    return { x: ((k - first + 0.5) * W) / count, y: 26 + level * LEVEL_H };
  };

  const nodes = [];
  const edges = [];
  for (let k = 1; k < 2 * n; k++) {
    const p = pos(k);
    if (k > 1) {
      const q = pos(k >> 1);
      const onPath = roles[k] === 'path' && roles[k >> 1] === 'path';
      edges.push(
        <line key={`e${k}`} x1={q.x} y1={q.y + NODE_H / 2} x2={p.x} y2={p.y - NODE_H / 2} className={onPath ? 'edge role-path' : 'edge'} />,
      );
    }
    const role = roles[k];
    nodes.push(
      <g key={`n${k}`} transform={`translate(${p.x},${p.y})`} className={`tnode${role ? ` role-${role}` : ''}`}>
        {showIndex && <text className="tidx" x={-NODE_W / 2 + 1} y={-NODE_H / 2 - 4} textAnchor="start">{k}</text>}
        <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx={7} />
        <text className="tval" dy="0.35em">{tree[k] ?? ''}</text>
        {badges[k] && (
          <g className="tbadge" transform={`translate(${NODE_W / 2 - 4},${-NODE_H / 2 - 9})`}>
            <rect x={-4} y={-8} width={badges[k]!.length * 7 + 8} height={15} rx={7.5} />
            <text x={badges[k]!.length * 3.5} y={0} dy="0.33em" textAnchor="middle">{badges[k]}</text>
          </g>
        )}
        {leafLabel && k >= n && <text className="tleaf" y={NODE_H / 2 + 14}>{leafLabel(k - n)}</text>}
      </g>,
    );
  }

  return (
    <div className="arr-scroll">
      <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="tree">
        {edges}
        {nodes}
      </svg>
    </div>
  );
}
