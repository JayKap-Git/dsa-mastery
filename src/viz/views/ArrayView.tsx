import type { Bi, Role } from '../engine/types';
import { T } from '../engine/T';
import { useKeepInView } from './useKeepInView';

export interface Pointer {
  at: number; // position (0-based slot in `values`)
  label: string;
  role?: Role;
}

export interface RangeMark {
  from: number; // positions, inclusive
  to: number;
  role: Role;
  label?: string;
}

export interface ArrayViewProps {
  values: (number | string | null)[];
  /** Index shown above slot 0 (0 for zero-based arrays, 1 for one-based). */
  base?: number;
  /** Custom labels above each slot (overrides `base`). */
  indexLabels?: (number | string)[];
  roles?: Partial<Record<number, Role>>;
  pointers?: Pointer[];
  ranges?: RangeMark[];
  title?: Bi | string;
  hideIndex?: boolean;
  /** Slot width in px. */
  cell?: number;
}

/** A row of array cells with index labels, pointer arrows and range brackets underneath. */
export function ArrayView({ values, base = 0, indexLabels, roles = {}, pointers = [], ranges = [], title, hideIndex, cell = 44 }: ArrayViewProps) {
  const cols = `repeat(${values.length}, ${cell}px)`;
  const scroller = useKeepInView<HTMLDivElement>([values, roles, pointers]);
  return (
    <div className="arr">
      {title && <div className="arr-title"><T v={title} ui /></div>}
      <div className="arr-scroll" ref={scroller}>
        <div className="arr-grid" style={{ gridTemplateColumns: cols }}>
          {!hideIndex &&
            values.map((_, i) => (
              <span key={`i${i}`} className="arr-idx" style={{ gridRow: 1, gridColumn: i + 1 }}>
                {indexLabels ? indexLabels[i] : base + i}
              </span>
            ))}
          {values.map((v, i) => (
            <span
              key={`v${i}`}
              className={`arr-cell${roles[i] ? ` role-${roles[i]}` : ''}${v === null ? ' empty' : ''}`}
              style={{ gridRow: 2, gridColumn: i + 1 }}
            >
              {v ?? ''}
            </span>
          ))}
          {ranges.map((r, k) => (
            <span
              key={`r${k}`}
              className={`arr-range role-${r.role}`}
              style={{ gridRow: 3 + k, gridColumn: `${r.from + 1} / ${r.to + 2}` }}
            >
              {r.label}
            </span>
          ))}
          {pointers.map((p, k) => (
            <span
              key={`p${k}`}
              className={`arr-ptr${p.role ? ` ptr-${p.role}` : ''}`}
              style={{ gridRow: 3 + ranges.length, gridColumn: p.at + 1 }}
            >
              ▲<b>{p.label}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
