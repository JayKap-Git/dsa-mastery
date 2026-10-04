import type { Role } from '../engine/types';
import { useKeepInView } from './useKeepInView';

export interface Interval {
  id: string;
  start: number;
  end: number;
  label: string;
  role?: Role;
  note?: string;
}

const ROW = 30;
const LABEL_W = 44;

/** Intervals on a shared time axis, one per row (scheduling, tasks). */
export function TimelineView({ items, min, max, unit = 34 }: { items: Interval[]; min: number; max: number; unit?: number }) {
  const scroller = useKeepInView<HTMLDivElement>([items]);
  const W = LABEL_W + (max - min) * unit + 16;
  const H = 24 + items.length * ROW;
  const x = (t: number) => LABEL_W + (t - min) * unit;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="arr-scroll" ref={scroller}>
      <svg className="timeline-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="timeline">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={18} x2={x(t)} y2={H} className="tl-grid" />
            <text x={x(t)} y={12} className="tl-tick">{t}</text>
          </g>
        ))}
        {items.map((it, r) => {
          const y = 24 + r * ROW;
          return (
            <g key={it.id} className={`tl-item${it.role ? ` role-${it.role}` : ''}`}>
              <text x={6} y={y + ROW / 2 - 2} dy="0.35em" className="tl-label">{it.label}</text>
              <rect x={x(it.start)} y={y + 3} width={Math.max(4, x(it.end) - x(it.start))} height={ROW - 10} rx={6} />
              {it.note && <text x={x(it.end) + 6} y={y + ROW / 2 - 2} dy="0.35em" className="tl-note">{it.note}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
