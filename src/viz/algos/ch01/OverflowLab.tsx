import { useMemo, useState } from 'react';
import { ActionButton, Segmented, VizShell } from '../../engine/controls';
import { T } from '../../engine/T';
import { evaluate, floorMod, group, javaRem, parseBig, type Op } from './overflow';

const PRESETS: { a: string; b: string; op: Op; label: { en: string; hi: string } }[] = [
  { a: '123456789', b: '123456789', op: '*', label: { en: 'Book example', hi: 'Book wala example' } },
  { a: '1000000000', b: '1000000000', op: '*', label: { en: '10⁹ × 10⁹', hi: '10⁹ × 10⁹' } },
  { a: '2147483647', b: '1', op: '+', label: { en: 'INT_MAX + 1', hi: 'INT_MAX + 1' } },
];

const SYMBOL: Record<Op, string> = { '+': '+', '-': '-', '*': '*' };

/** Type numbers, see what Java's int and long really compute. */
export default function OverflowLab() {
  const [a, setA] = useState(PRESETS[0].a);
  const [b, setB] = useState(PRESETS[0].b);
  const [op, setOp] = useState<Op>('*');
  const [x, setX] = useState('-7');
  const [m, setM] = useState('3');

  const A = parseBig(a), B = parseBig(b), X = parseBig(x), M = parseBig(m);
  const r = useMemo(() => (A !== null && B !== null ? evaluate(A, B, op) : null), [A, B, op]);
  const modOk = X !== null && M !== null && M > 0n;

  const row = (code: string, value: bigint | null, bad: boolean, note: { en: string; hi: string }) => (
    <tr className={bad ? 'lab-bad' : value === null ? 'lab-na' : 'lab-ok'}>
      <td><code>{code}</code></td>
      <td className="lab-num">{value === null ? '—' : group(value)}</td>
      <td><T v={note} /></td>
    </tr>
  );

  return (
    <VizShell
      title={{ en: 'Overflow and modulo lab', hi: 'Overflow aur modulo lab' }}
      controls={<>
        <div className="field grow"><label htmlFor="ov-a">a</label><input id="ov-a" type="text" value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} aria-invalid={A === null} /></div>
        <Segmented label={{ en: 'Operation', hi: 'Operation' }} value={op} onChange={setOp} options={[{ value: '+', label: '+' }, { value: '-', label: '−' }, { value: '*', label: '×' }]} />
        <div className="field grow"><label htmlFor="ov-b">b</label><input id="ov-b" type="text" value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} aria-invalid={B === null} /></div>
        {PRESETS.map((p) => <ActionButton key={p.a + p.op + p.b} label={p.label} onClick={() => { setA(p.a); setB(p.b); setOp(p.op); }} />)}
      </>}
    >
      <div className="stage">
        {r ? (
          <div className="cx lab"><table><tbody>
            {row(`int r = a ${SYMBOL[op]} b;`, r.asInt, r.intOverflow,
              r.asInt === null ? { en: 'a or b does not even fit in an int.', hi: 'a ya b int mein fit hi nahi hota.' }
                : r.intOverflow ? { en: 'Overflow! The true result wrapped around modulo 2³², silently.', hi: 'Overflow! Asli answer 2³² ke modulo ghoom gaya, bina kisi warning ke.' }
                : { en: 'Fits in int (±2.1·10⁹).', hi: 'int (±2.1·10⁹) mein fit hai.' })}
            {row(`long r = a ${SYMBOL[op]} b;  // a, b are int`, r.asInt, r.intOverflow,
              { en: 'Same wrong value: the int result overflows first, then gets widened to long.', hi: 'Wahi galat value: pehle int mein overflow, phir long mein convert.' })}
            {row(`long r = (long) a ${SYMBOL[op]} b;`, r.asLong, r.longOverflow,
              r.asLong === null ? { en: 'Too big even for long.', hi: 'long ke liye bhi bahut bada.' }
                : r.longOverflow ? { en: 'Overflows long too (±9.2·10¹⁸): use BigInteger or think modulo.', hi: 'long bhi overflow (±9.2·10¹⁸): BigInteger lo ya modulo socho.' }
                : { en: 'Correct: widen BEFORE the operation.', hi: 'Sahi: operation se PEHLE long banao.' })}
            {row('BigInteger (exact)', r.exact, false, { en: 'The true value.', hi: 'Asli value.' })}
          </tbody></table></div>
        ) : <p className="field-err"><T v={{ en: 'Type whole numbers (1e9 works too).', hi: 'Whole numbers daalo (1e9 bhi chalega).' }} /></p>}

        <h4 className="lab-h"><T v={{ en: 'Remainders of negative numbers', hi: 'Negative numbers ke remainder' }} /></h4>
        <div className="viz-controls lab-inline">
          <div className="field num"><label htmlFor="ov-x">x</label><input id="ov-x" type="text" value={x} onChange={(e) => setX(e.target.value)} /></div>
          <div className="field num"><label htmlFor="ov-m">m</label><input id="ov-m" type="text" value={m} onChange={(e) => setM(e.target.value)} /></div>
        </div>
        {modOk ? (
          <div className="cx lab"><table><tbody>
            {row(`x % m`, javaRem(X!, M!), javaRem(X!, M!) < 0n, { en: 'Java keeps the sign of x, so this can be negative.', hi: 'Java x ka sign rakhta hai, toh yeh negative ho sakta hai.' })}
            {row(`Math.floorMod(x, m)`, floorMod(X!, M!), false, { en: 'Always in 0..m−1: what “x mod m” means in maths.', hi: 'Hamesha 0..m−1 mein: maths wala “x mod m”.' })}
          </tbody></table></div>
        ) : <p className="field-err"><T v={{ en: 'Use whole numbers with m > 0.', hi: 'Whole numbers lo, m > 0 ho.' }} /></p>}
      </div>
    </VizShell>
  );
}
