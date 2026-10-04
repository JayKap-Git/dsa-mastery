import { Fragment, useLayoutEffect, useRef } from 'react';
import type { Bi, Role } from '../engine/types';
import { T } from '../engine/T';

export interface BitRowSpec {
  label: string;
  /** Read as a 32-bit pattern; only the low `width` bits are drawn. */
  value: number;
  /** Roles by bit position (0 = rightmost). */
  roles?: Partial<Record<number, Role>>;
  /** Shown to the right, e.g. the decimal value or the set. */
  note?: string;
  /** Draw a rule above this row (for result rows). */
  sep?: boolean;
  /** Makes each bit a toggle button. */
  onToggle?: (bit: number) => void;
}

interface BitTableProps {
  rows: BitRowSpec[];
  width: number;
  title?: Bi | string;
  /** Header above the bits; defaults to the bit positions. */
  header?: Bi | string;
}

/** Rows of bits aligned by position, highest bit on the left, with a small gap between groups of four. */
export function BitTable({ rows, width, title }: BitTableProps) {
  const positions = Array.from({ length: width }, (_, j) => width - 1 - j);
  const nib = (i: number) => (i % 4 === 3 && i !== width - 1 ? ' nib' : '');
  // On narrow screens start at the low bits (the right end): that's where the action usually is.
  const scroller = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [width]);
  return (
    <div className="bit-table">
      {title && <div className="arr-title"><T v={title} ui /></div>}
      <div className="arr-scroll" ref={scroller}>
        <div className="bits" style={{ gridTemplateColumns: `auto repeat(${width}, auto) auto` }}>
          <span />
          {positions.map((i) => <span key={i} className={`b-idx${nib(i)}`}>{i}</span>)}
          <span />
          {rows.map((r, ri) => (
            <Fragment key={ri}>
              {r.sep && <span className="b-sep" />}
              <span className="b-lab">{r.label}</span>
              {positions.map((i) => {
                const one = ((r.value >>> i) & 1) === 1;
                const role = r.roles?.[i];
                const cls = `bit${one ? ' one' : ''}${role ? ` role-${role}` : ''}${nib(i)}`;
                return r.onToggle
                  ? <button type="button" key={i} className={cls} onClick={() => r.onToggle!(i)} aria-label={`${r.label}: bit ${i}`} aria-pressed={one}>{one ? 1 : 0}</button>
                  : <span key={i} className={cls}>{one ? 1 : 0}</span>;
              })}
              <span className="b-val">{r.note ?? ''}</span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
