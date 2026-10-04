import { useMemo, useState } from 'react';
import code from '@java/ch08/TwoPointers.java?region=subarray';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceSubarraySum } from './amortized';

const BOOK = [1, 3, 2, 5, 1, 1, 2, 3];

export default function SubarraySumViz() {
  const [a, setA] = useState(BOOK);
  const [x, setX] = useState(8);
  const frames = useMemo(() => traceSubarraySum(a, x), [a, x]);
  return (
    <VizShell
      title={{ en: 'Two pointers: a subarray with sum x', hi: 'Two pointers: sum x wala subarray' }}
      controls={<>
        <ArrayInput label={{ en: 'Positive numbers', hi: 'Positive numbers' }} value={a} onChange={setA} min={1} max={20} maxLen={12} />
        <NumberField label="x" value={x} min={1} max={99} onChange={setX} />
        <ActionButton onClick={() => { setA(BOOK); setX(8); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(10, 1, 6))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${a.join()}|${x}`}
        code={code}
        legend={[
          { role: 'range', label: { en: 'window', hi: 'window' } },
          L.changed,
          { role: 'minus', label: { en: 'leaves the window', hi: 'window se bahar' } },
          L.muted,
          { role: 'done', label: { en: 'sum = x', hi: 'sum = x' } },
        ]}
        render={({ state }) => <ArrayView values={state.a} roles={state.roles} pointers={state.pointers} ranges={state.ranges} />}
      />
    </VizShell>
  );
}
