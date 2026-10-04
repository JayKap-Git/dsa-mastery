import { useMemo, useState } from 'react';
import code from '@java/ch10/BitmaskDP.java?region=elevator';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell, BOOK_EXAMPLE } from '../../engine/controls';
import type { Role } from '../../engine/types';
import { ArrayView } from '../../views/ArrayView';
import { popcount, setLabel, traceElevator } from './bits';

const BOOK = [2, 3, 3, 5, 6];

export default function ElevatorViz() {
  const [w, setW] = useState(BOOK);
  const [cap, setCap] = useState(10);
  const x = Math.max(cap, ...w);
  const frames = useMemo(() => traceElevator(w, x), [w, x]);
  const n = w.length;
  const layers = Array.from({ length: n + 1 }, (_, size) => Array.from({ length: 1 << n }, (_, s) => s).filter((s) => popcount(s) === size));
  return (
    <VizShell
      title={{ en: 'Elevator rides: best[S] = (rides, last)', hi: 'Elevator rides: best[S] = (rides, last)' }}
      controls={<>
        <ArrayInput label={{ en: 'Weights (people 0, 1, …)', hi: 'Weights (log 0, 1, …)' }} value={w} onChange={setW} min={1} max={20} maxLen={5} />
        <NumberField label={{ en: 'max weight x', hi: 'max weight x' }} value={x} min={Math.max(...w)} max={40} onChange={setCap} />
        <ActionButton label={BOOK_EXAMPLE} onClick={() => { setW(BOOK); setCap(10); }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${w.join()}|${x}`}
        code={code}
        legend={[
          { role: 'changed', label: { en: 'set S being solved', hi: 'set S solve ho raha' } },
          { role: 'compare', label: { en: 'S without one person', hi: 'S, ek insaan ke bina' } },
          { role: 'range', label: { en: 'best choice', hi: 'best choice' } },
          { role: 'done', label: { en: 'everyone', hi: 'sab log' } },
        ]}
        render={({ state }) => (
          <div className="stack">
            {layers.map((masks, size) => (
              <ArrayView
                key={size}
                title={`|S| = ${size}`}
                values={masks.map((s) => (state.best[s] ? `${state.best[s]![0]},${state.best[s]![1]}` : null))}
                indexLabels={masks.map((s) => setLabel(s, ''))}
                roles={Object.fromEntries(masks.map((s, j) => [j, state.roles[s]]).filter(([, r]) => r)) as Partial<Record<number, Role>>}
                cell={56}
              />
            ))}
          </div>
        )}
      />
    </VizShell>
  );
}
