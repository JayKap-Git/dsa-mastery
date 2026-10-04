import { useMemo, useState } from 'react';
import code from '@java/ch08/TwoPointers.java?region=twoSum';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceTwoSum } from './amortized';

const BOOK = [1, 4, 5, 6, 7, 9, 9, 10];
const sorted = (v: number[]) => [...v].sort((p, q) => p - q);

export default function TwoSumViz() {
  const [a, setA] = useState(BOOK);
  const [x, setX] = useState(12);
  const frames = useMemo(() => traceTwoSum(a, x), [a, x]);
  return (
    <VizShell
      title={{ en: '2SUM with two pointers', hi: 'Two pointers se 2SUM' }}
      controls={<>
        <ArrayInput label={{ en: 'Numbers (sorted for you)', hi: 'Numbers (khud sort ho jaayenge)' }} value={a} onChange={(v) => setA(sorted(v))} min={-50} max={50} maxLen={12} />
        <NumberField label="x" value={x} min={-99} max={99} onChange={setX} />
        <ActionButton onClick={() => { setA(BOOK); setX(12); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(sorted(randArray(9, 1, 15)))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${a.join()}|${x}`}
        code={code}
        legend={[
          { role: 'minus', label: { en: 'too big: R moves', hi: 'bahut bada: R hatega' } },
          { role: 'compare', label: { en: 'too small: L moves', hi: 'bahut chhota: L hatega' } },
          L.muted,
          { role: 'done', label: { en: 'pair found', hi: 'pair mil gaya' } },
        ]}
        render={({ state }) => <ArrayView values={state.a} roles={state.roles} pointers={state.pointers} />}
      />
    </VizShell>
  );
}
