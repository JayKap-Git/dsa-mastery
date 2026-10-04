import { useMemo, useState } from 'react';
import code from '@java/ch02/MaxSubarray.java?region=kadane';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceKadane } from './kadane';

const BOOK = [-1, 2, 4, -3, 5, 2, -5, 2];

export default function KadaneViz() {
  const [a, setA] = useState(BOOK);
  const frames = useMemo(() => traceKadane(a), [a]);
  return (
    <VizShell
      title={{ en: 'Maximum subarray sum in O(n) (Kadane)', hi: 'Maximum subarray sum O(n) mein (Kadane)' }}
      controls={<>
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={a} onChange={setA} maxLen={14} />
        <ActionButton onClick={() => setA(BOOK)} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(10, -9, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={a.join()}
        code={code}
        legend={[L.active, { role: 'range', label: { en: 'best subarray ending here', hi: 'yahan khatam hone wala best subarray' } }, { role: 'done', label: { en: 'best so far', hi: 'ab tak ka best' } }]}
        render={({ state }) => <ArrayView values={state.a} roles={state.roles} ranges={state.ranges} />}
      />
    </VizShell>
  );
}
