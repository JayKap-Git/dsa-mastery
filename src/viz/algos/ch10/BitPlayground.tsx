import { useId, useState } from 'react';
import { ActionButton, NumberField, VizShell } from '../../engine/controls';
import { T, useText } from '../../engine/T';
import type { Role } from '../../engine/types';
import { BitTable, type BitRowSpec } from '../../views/BitTable';
import { applyOp, javaCounts, OPS, parseInt32, type BitOp } from './bits';

const PRESETS: { x: string; y: string; op: BitOp; k: number; label: string }[] = [
  { x: '22', y: '26', op: 'and', k: 2, label: '22 & 26' },
  { x: '29', y: '26', op: 'not', k: 2, label: '~29' },
  { x: '43', y: '26', op: 'neg', k: 2, label: '−43' },
  { x: '14', y: '26', op: 'shl', k: 2, label: '14 << 2' },
  { x: '5328', y: '26', op: 'lowest', k: 4, label: '5328' },
];

/** Type an int, pick a Java bit operation, and see every bit. Click a bit of x or y to flip it. */
export default function BitPlayground() {
  const ids = [useId(), useId(), useId()];
  const text = useText();
  const [xs, setXs] = useState('22');
  const [ys, setYs] = useState('26');
  const [op, setOp] = useState<BitOp>('and');
  const [k, setK] = useState(2);
  const x = parseInt32(xs), y = parseInt32(ys);
  const spec = OPS.find((o) => o.op === op)!;
  const ok = x !== null && (!spec.binary || y !== null);
  const r = ok ? applyOp(op, x!, y ?? 0, k) : 0;
  const vals = [x ?? 0, spec.binary ? y ?? 0 : 0, r];
  const width = vals.some((v) => v < 0 || v >= 1 << 16) ? 32 : vals.some((v) => v >= 256) ? 16 : 8;
  const changed: Partial<Record<number, Role>> = {};
  for (let i = 0; i < 32; i++) if ((((x ?? 0) ^ r) >>> i) & 1) changed[i] = 'changed';
  const kRole: Partial<Record<number, Role>> = spec.usesK && ['set', 'clear', 'flip'].includes(op) ? { [k]: 'active' } : {};
  const rows: BitRowSpec[] = [
    { label: 'x', value: x ?? 0, note: String(x), roles: kRole, onToggle: (b) => setXs(String((x! ^ (1 << b)) | 0)) },
    ...(spec.binary ? [{ label: 'y', value: y ?? 0, note: String(y), onToggle: (b: number) => setYs(String((y! ^ (1 << b)) | 0)) }] : []),
    { label: spec.code, value: r, note: String(r), roles: changed, sep: true },
  ];
  const c = javaCounts(x ?? 0);
  return (
    <VizShell
      title={{ en: 'Bit playground: Java int operations', hi: 'Bit playground: Java int operations' }}
      controls={<>
        <div className="field num"><label htmlFor={ids[0]}>x</label><input id={ids[0]} type="text" value={xs} onChange={(e) => setXs(e.target.value)} spellCheck={false} aria-invalid={x === null} /></div>
        <div className="field">
          <label htmlFor={ids[1]}><T v={{ en: 'Operation', hi: 'Operation' }} ui /></label>
          <select id={ids[1]} value={op} onChange={(e) => setOp(e.target.value as BitOp)}>
            {OPS.map((o) => <option key={o.op} value={o.op}>{o.code}</option>)}
          </select>
        </div>
        {spec.binary && <div className="field num"><label htmlFor={ids[2]}>y</label><input id={ids[2]} type="text" value={ys} onChange={(e) => setYs(e.target.value)} spellCheck={false} aria-invalid={y === null} /></div>}
        {spec.usesK && <NumberField label="k" value={k} min={0} max={31} onChange={setK} />}
        {PRESETS.map((p) => <ActionButton key={p.label} label={`${text({ en: 'Book', hi: 'Book' })}: ${p.label}`} onClick={() => { setXs(p.x); setYs(p.y); setOp(p.op); setK(p.k); }} />)}
      </>}
    >
      <div className="stage">
        {ok ? (
          <>
            <BitTable rows={rows} width={width} title={width < 32 ? { en: `low ${width} bits shown (the higher bits are all 0); click a bit of x or y to flip it`, hi: `neeche ke ${width} bits dikh rahe hain (upar ke sab 0); x ya y ka koi bit click karke ulta karo` } : { en: 'all 32 bits of a Java int; click a bit of x or y to flip it', hi: 'Java int ke saare 32 bits; x ya y ka koi bit click karke ulta karo' }} />
            <p className="viz-note"><code>{spec.code}</code> = <b>{r}</b>. <T v={spec.say} /></p>
            <div className="lab-facts">
              <span>Integer.bitCount(x) = <b>{c.pop}</b></span>
              <span>numberOfLeadingZeros = <b>{c.clz}</b></span>
              <span>numberOfTrailingZeros = <b>{c.ctz}</b></span>
              <span>parity = <b>{c.parity}</b></span>
              <span>Integer.toUnsignedString(x) = <b>{String((x ?? 0) >>> 0)}</b></span>
            </div>
          </>
        ) : <p className="field-err"><T v={{ en: 'Type a Java int: 43, -43, 0b101011 or 0x2B (between −2³¹ and 2³¹ − 1).', hi: 'Java int daalo: 43, -43, 0b101011 ya 0x2B (−2³¹ se 2³¹ − 1 ke beech).' }} /></p>}
      </div>
    </VizShell>
  );
}
