import { useState } from 'react';
import { VizShell } from '../../engine/controls';
import { T } from '../../engine/T';
import { CLASSES, RULES, ruleFor, sci, seconds, verdict } from './complexity';

const STOPS = [10, 20, 50, 100, 500, 1000, 5000, 10_000, 100_000, 200_000, 1_000_000, 10_000_000, 1e9, 1e12, 1e18];
const pretty = (n: number) => (n >= 1e6 ? sci(n) : n.toLocaleString('en-US'));

/** Slide n and see which complexities fit in a one-second time limit. */
export default function ComplexityExplorer() {
  const [i, setI] = useState(8);
  const n = STOPS[i];
  const rule = ruleFor(n);
  const maxLog = 18;

  return (
    <VizShell title={{ en: 'Will it run in time?', hi: 'Kya time limit mein chalega?' }}
      controls={<div className="field grow">
        <label htmlFor="cx-n"><T v={{ en: `Input size n = ${pretty(n)}`, hi: `Input size n = ${pretty(n)}` }} ui /></label>
        <input id="cx-n" type="range" min={0} max={STOPS.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} className="cx-slider" />
      </div>}
    >
      <div className="stage">
        <div className="cx-rows">
          {CLASSES.map((c) => {
            const ops = c.ops(n);
            const v = verdict(ops);
            const w = Number.isFinite(ops) ? Math.min(100, (Math.log10(Math.max(ops, 1)) / maxLog) * 100) : 100;
            return (
              <div key={c.id} className={`cx-row ${v}`}>
                <code className="cx-label">{c.label}</code>
                <div className="cx-bar"><span style={{ width: `${Math.max(2, w)}%` }} /></div>
                <span className="cx-ops">{sci(ops)} ops</span>
                <span className="cx-time">{seconds(ops)}</span>
                <span className="cx-verdict">{v === 'fast' ? '✓' : v === 'tight' ? '~' : '✗'}</span>
              </div>
            );
          })}
        </div>
        <p className="muted cx-note">
          <T v={{ en: 'Assuming about 10⁸ simple operations per second. ✓ comfortable · ~ borderline (constant factors decide) · ✗ too slow.', hi: 'Maan ke chalo ~10⁸ simple operations per second. ✓ aaram se · ~ border pe (constant factor decide karega) · ✗ bahut slow.' }} />
        </p>
        <div className="cx lab"><table>
          <caption><T v={{ en: 'The book’s rule of thumb (1 second)', hi: 'Book ka rule of thumb (1 second)' }} ui /></caption>
          <tbody>
            {RULES.map((r, k) => (
              <tr key={r.need} className={k === rule ? 'lab-ok cx-hit' : ''}>
                <td>{r.max === Infinity ? 'n is huge' : `n ≤ ${pretty(r.max)}`}</td>
                <td>{r.need}</td>
                <td>{k === rule ? <T v={{ en: '← your n', hi: '← tumhara n' }} ui /> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </VizShell>
  );
}
