import { useMemo, useState } from 'react';
import code from '@java/ch10/BitSets.java?region=submasks';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { BitTable } from '../../views/BitTable';
import { setLabel, traceSubmasks } from './bits';

const BOOK = [1, 3, 4, 8];

export default function SubmaskViz() {
  const [els, setEls] = useState(BOOK);
  const x = els.reduce((m, e) => m | (1 << e), 0);
  const width = Math.max(4, Math.max(...els) + 1);
  const frames = useMemo(() => traceSubmasks(x, width), [x, width]);
  return (
    <VizShell
      title={{ en: 'Every subset of x with b = (b − x) & x', hi: 'b = (b − x) & x se x ka har subset' }}
      controls={<>
        <ArrayInput
          label={{ en: 'Elements of x (0–9)', hi: 'x ke elements (0–9)' }} value={els} onChange={setEls} min={0} max={9} maxLen={6}
          validate={(v) => (new Set(v).size !== v.length ? { en: 'No repeated elements.', hi: 'Elements repeat nahi hone chahiye.' } : null)}
        />
        <ActionButton label={{ en: 'Book set {1,3,4,8}', hi: 'Book wala set {1,3,4,8}' }} onClick={() => setEls(BOOK)} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={String(x)}
        code={code}
        legend={[{ role: 'done', label: { en: 'in b', hi: 'b mein' } }, { role: 'muted', label: { en: 'outside x: the carry passes', hi: 'x ke bahar: carry paar jaata hai' } }, L.changed]}
        render={({ state }) => (
          <div className="stack">
            <BitTable rows={state.rows} width={width} />
            <div className="lab-facts">{state.found.map((b, i) => <span key={i}><b>{setLabel(b)}</b></span>)}</div>
          </div>
        )}
      />
    </VizShell>
  );
}
