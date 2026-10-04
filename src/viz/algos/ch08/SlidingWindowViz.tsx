import { useMemo, useState } from 'react';
import code from '@java/ch08/SlidingWindowMin.java?region=deque';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { ArrayView } from '../../views/ArrayView';
import { BarsView } from '../../views/BarsView';
import { traceWindowMin } from './amortized';

const BOOK = [2, 1, 4, 5, 3, 4, 1, 2];

export default function SlidingWindowViz() {
  const [a, setA] = useState(BOOK);
  const [k, setK] = useState(4);
  const kk = Math.min(k, a.length);
  const frames = useMemo(() => traceWindowMin(a, kk), [a, kk]);
  const top = Math.max(2, ...frames[frames.length - 1].state.work);
  return (
    <VizShell
      title={{ en: 'Sliding window minimum with a deque', hi: 'Deque se sliding window minimum' }}
      controls={<>
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={a} onChange={setA} min={0} max={99} maxLen={12} />
        <NumberField label={{ en: 'window k', hi: 'window k' }} value={kk} min={1} max={a.length} onChange={setK} />
        <ActionButton onClick={() => { setA(BOOK); setK(4); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(10, 1, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${a.join()}|${kk}`}
        code={code}
        legend={[
          L.active,
          { role: 'range', label: { en: 'window', hi: 'window' } },
          { role: 'compare', label: { en: 'in the deque', hi: 'deque mein' } },
          { role: 'minus', label: { en: 'popped', hi: 'pop hua' } },
          { role: 'done', label: { en: 'window minimum', hi: 'window minimum' } },
        ]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="array" values={state.a} roles={state.roles} ranges={state.ranges} />
            <ArrayView
              title={{ en: 'deque, front → back (values; positions above)', hi: 'deque, front → back (values; upar positions)' }}
              values={state.dq.length ? state.dq.map((p) => state.a[p]) : [null]}
              indexLabels={state.dq.length ? state.dq.map((p) => `@${p}`) : ['']}
              roles={state.dqRoles}
            />
            <ArrayView title={{ en: 'minimum of each window', hi: 'har window ka minimum' }} values={state.mins} roles={state.minRoles} />
            <div className="arr">
              <div className="arr-title"><T v={{ en: 'deque operations at each position (≤ 2n in total)', hi: 'har position pe deque operations (total ≤ 2n)' }} ui /></div>
              <BarsView values={state.work} max={top} height={110} />
            </div>
          </div>
        )}
      />
    </VizShell>
  );
}
