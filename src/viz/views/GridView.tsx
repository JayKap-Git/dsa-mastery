import type { Bi, Role } from '../engine/types';
import { T } from '../engine/T';
import { useKeepInView } from './useKeepInView';

export interface Region {
  r1: number; c1: number; r2: number; c2: number; // inclusive cell coordinates
  role: Role;
  label?: string;
}

export interface GridViewProps {
  rows: (number | string | null)[][];
  rowLabels?: (number | string)[];
  colLabels?: (number | string)[];
  /** key: `${r},${c}` */
  roles?: Record<string, Role>;
  regions?: Region[];
  title?: Bi | string;
  cell?: number;
  corner?: string;
  /** Bigger cell text (board pieces like ♛). */
  large?: boolean;
}

/** A 2D table (DP tables, 2D prefix sums, sparse tables) with optional outlined regions. */
export function GridView({ rows, rowLabels, colLabels, roles = {}, regions = [], title, cell = 42, corner = '', large }: GridViewProps) {
  const nCols = Math.max(...rows.map((r) => r.length), colLabels?.length ?? 0);
  const hasRowLab = !!rowLabels;
  const hasColLab = !!colLabels;
  const lab = hasRowLab ? Math.max(40, 12 + 9 * Math.max(...rowLabels!.map((r) => String(r).length))) : 0;
  const head = hasColLab ? 24 : 0;
  const scroller = useKeepInView<HTMLDivElement>([rows, roles, regions]);

  return (
    <div className="grid-view">
      {title && <div className="arr-title"><T v={title} ui /></div>}
      <div className="arr-scroll" ref={scroller}>
        <div className={large ? 'gv gv-large' : 'gv'} style={{ width: lab + nCols * cell, height: head + rows.length * cell }}>
          {hasColLab && hasRowLab && <span className="gv-corner" style={{ width: lab, height: head }}>{corner}</span>}
          {colLabels?.map((c, j) => (
            <span key={`c${j}`} className="gv-head" style={{ left: lab + j * cell, top: 0, width: cell, height: head }}>{c}</span>
          ))}
          {rowLabels?.map((r, i) => (
            <span key={`r${i}`} className="gv-head" style={{ left: 0, top: head + i * cell, width: lab, height: cell }}>{r}</span>
          ))}
          {rows.map((row, i) =>
            Array.from({ length: nCols }, (_, j) => {
              const v = row[j];
              const role = roles[`${i},${j}`];
              return (
                <span
                  key={`${i},${j}`}
                  className={`gv-cell${role ? ` role-${role}` : ''}${v === null || v === undefined ? ' empty' : ''}`}
                  style={{ left: lab + j * cell, top: head + i * cell, width: cell, height: cell }}
                >
                  {v ?? ''}
                </span>
              );
            }),
          )}
          {regions.map((g, k) => (
            <span
              key={`g${k}`}
              className={`gv-region role-${g.role}`}
              style={{
                left: lab + g.c1 * cell, top: head + g.r1 * cell,
                width: (g.c2 - g.c1 + 1) * cell, height: (g.r2 - g.r1 + 1) * cell,
              }}
            >
              {g.label && <b>{g.label}</b>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
