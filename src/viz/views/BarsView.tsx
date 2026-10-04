import type { Role } from '../engine/types';
import type { Pointer, RangeMark } from './ArrayView';
import { useKeepInView } from './useKeepInView';

export interface BarsViewProps {
  values: number[];
  roles?: Partial<Record<number, Role>>;
  pointers?: Pointer[];
  ranges?: RangeMark[];
  /** Height scale; defaults to the largest value. */
  max?: number;
  height?: number;
}

/** An array drawn as bars (sorting). Bars, labels, index row, then range marks and pointers below. */
export function BarsView({ values, roles = {}, pointers = [], ranges = [], max, height = 150 }: BarsViewProps) {
  const top = Math.max(1, max ?? Math.max(...values.map((v) => Math.abs(v)), 1));
  const cols = `repeat(${values.length}, 40px)`;
  const scroller = useKeepInView<HTMLDivElement>([values, roles, pointers]);
  return (
    <div className="arr-scroll" ref={scroller}>
      <div className="bars" style={{ gridTemplateColumns: cols }}>
        {values.map((v, i) => (
          <div key={`b${i}`} className="bar-col" style={{ gridRow: 1, gridColumn: i + 1, height }}>
            <span className="bar-val">{v}</span>
            <span className={`bar${roles[i] ? ` role-${roles[i]}` : ''}`} style={{ height: `${Math.max(6, (Math.abs(v) / top) * (height - 22))}px` }} />
          </div>
        ))}
        {values.map((_, i) => (
          <span key={`i${i}`} className="arr-idx" style={{ gridRow: 2, gridColumn: i + 1 }}>{i}</span>
        ))}
        {ranges.map((r, k) => (
          <span key={`r${k}`} className={`arr-range role-${r.role}`} style={{ gridRow: 3 + k, gridColumn: `${r.from + 1} / ${r.to + 2}` }}>{r.label}</span>
        ))}
        {pointers.map((p, k) => (
          <span key={`p${k}`} className={`arr-ptr${p.role ? ` ptr-${p.role}` : ''}`} style={{ gridRow: 3 + ranges.length, gridColumn: p.at + 1 }}>▲<b>{p.label}</b></span>
        ))}
      </div>
    </div>
  );
}
