import { hierarchy, tree as d3tree } from 'd3-hierarchy';
import type { Role } from '../engine/types';
import { useKeepInView } from './useKeepInView';

export interface BTNode {
  id: string | number;
  label: string;
  /** Small text under the node (e.g. the character of a Huffman leaf). */
  sub?: string;
  /** Text on the edge from the parent to this node (e.g. 0 / 1). */
  edge?: string;
  children?: BTNode[];
}

const NODE_W = 40, NODE_H = 28, DX = 52, DY = 64;

/** Any binary tree or forest, laid out with d3-hierarchy (Huffman, tries, recursion, BSTs). */
export function BinaryTreeView({ roots, roles = {} }: { roots: BTNode[]; roles?: Record<string | number, Role> }) {
  const scroller = useKeepInView<HTMLDivElement>([roots, roles]);
  const laid = roots.map((r) => d3tree<BTNode>().nodeSize([DX, DY])(hierarchy(r, (d) => d.children)));
  // Place the trees of the forest side by side.
  let offset = 0;
  const placed = laid.map((t) => {
    const xs = t.descendants().map((d) => d.x);
    const lo = Math.min(...xs), hi = Math.max(...xs);
    const shift = offset - lo + NODE_W / 2 + 8;
    offset += hi - lo + DX + 12;
    return { t, shift };
  });
  const depth = Math.max(0, ...laid.map((t) => t.height));
  const W = Math.max(offset, 60);
  const H = (depth + 1) * DY + 10;

  return (
    <div className="arr-scroll" ref={scroller}>
      <svg className="tree-svg bt-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="tree">
        {placed.map(({ t, shift }, i) => (
          <g key={i}>
            {t.links().map((l) => {
              const x1 = l.source.x + shift, y1 = l.source.y + 20, x2 = l.target.x + shift, y2 = l.target.y + 20;
              const onPath = roles[l.target.data.id] === 'path' || roles[l.target.data.id] === 'done';
              return (
                <g key={`${l.source.data.id}-${l.target.data.id}`}>
                  <line x1={x1} y1={y1 + NODE_H / 2} x2={x2} y2={y2 - NODE_H / 2} className={onPath ? 'edge role-path' : 'edge'} />
                  {l.target.data.edge && <text x={(x1 + x2) / 2 + (x2 < x1 ? -8 : 8)} y={(y1 + y2) / 2 + 4} className="bt-edge">{l.target.data.edge}</text>}
                </g>
              );
            })}
            {t.descendants().map((d) => {
              const role = roles[d.data.id];
              return (
                <g key={d.data.id} transform={`translate(${d.x + shift},${d.y + 20})`} className={`tnode${role ? ` role-${role}` : ''}`}>
                  <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx={d.children ? 14 : 7} />
                  <text className="tval" dy="0.35em">{d.data.label}</text>
                  {d.data.sub && <text className="tleaf" y={NODE_H / 2 + 13}>{d.data.sub}</text>}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
