import { useState } from 'react';
import { ActionButton, NumberField, VizShell } from '../../engine/controls';
import { T } from '../../engine/T';
import { sci } from '../ch02/complexity';
import { BOOK_7x7, LEVELS, countPaths } from './gridPaths';

interface Row { paths: number; calls: number; ms: number }

/** Run the grid-path search at every optimisation level and compare the work done. */
export default function GridPathsLab() {
  const [n, setN] = useState(5);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const out: Row[] = [];
    for (let lvl = 0; lvl < LEVELS.length; lvl++) {
      await new Promise((r) => setTimeout(r, 0)); // keep the page responsive between levels
      const t = performance.now();
      const r = countPaths(n, lvl);
      out.push({ ...r, ms: performance.now() - t });
      setRows(out.slice());
    }
    setBusy(false);
  };

  const maxCalls = rows ? Math.max(...rows.map((r) => r.calls)) : 1;
  return (
    <VizShell
      title={{ en: 'Pruning lab: grid paths', hi: 'Pruning lab: grid paths' }}
      controls={<>
        <NumberField label="n" value={n} min={3} max={6} onChange={(v) => { setN(v); setRows(null); }} />
        <ActionButton onClick={() => void run()} label={busy ? { en: 'Running…', hi: 'Chal raha hai…' } : { en: `Run all levels on ${n}×${n}`, hi: `${n}×${n} pe saare levels chalao` }} />
      </>}
    >
      <div className="stage">
        <p className="muted" style={{ marginTop: 0 }}>
          <T v={{ en: 'Count paths from the top-left to the bottom-right square that visit every square once. Each level adds one of the book’s optimisations; all levels must find the same number of paths.', hi: 'Top-left se bottom-right tak aise paths gino jo har square ek baar visit karein. Har level book ka ek optimisation jodta hai; saare levels ko same paths milne chahiye.' }} />
        </p>
        <div className="cx lab"><table>
          <thead><tr><th>Level</th><th>Paths</th><th>Calls</th><th></th></tr></thead>
          <tbody>
            {LEVELS.map((l, i) => {
              const r = rows?.[i];
              return (
                <tr key={i} className={r ? 'lab-ok' : 'lab-na'}>
                  <td><b>{i}</b> <T v={l} /></td>
                  <td className="lab-num">{r ? r.paths.toLocaleString('en-US') : '—'}</td>
                  <td className="lab-num">{r ? r.calls.toLocaleString('en-US') : '—'}</td>
                  <td style={{ width: '30%' }}>{r && <div className="cx-bar"><span style={{ width: `${Math.max(2, (Math.log10(r.calls) / Math.log10(maxCalls)) * 100)}%` }} /></div>}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        <h4 className="lab-h"><T v={{ en: 'The book’s 7×7 measurements (111,712 paths)', hi: 'Book ke 7×7 measurements (111,712 paths)' }} /></h4>
        <div className="cx lab"><table><tbody>
          {BOOK_7x7.map((b) => (
            <tr key={b.level}><td><b>{b.level}</b> <T v={LEVELS[b.level]} /></td><td className="lab-num">{b.seconds} s</td><td className="lab-num">{sci(b.calls)} calls</td></tr>
          ))}
        </tbody></table></div>
        <p className="muted"><T v={{ en: 'From 483 s to 0.6 s, about 800× faster, with the same answer. The biggest wins prune near the top of the search tree.', hi: '483 s se 0.6 s — lagbhag 800× tez, answer wahi. Sabse bade fayde search tree ke upar wale hisse mein pruning se aate hain.' }} /></p>
      </div>
    </VizShell>
  );
}
