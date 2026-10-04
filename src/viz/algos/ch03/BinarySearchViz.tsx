import { useMemo, useState } from 'react';
import m1 from '@java/ch03/BinarySearch.java?region=method1';
import m2 from '@java/ch03/BinarySearch.java?region=method2';
import bounds from '@java/ch03/BinarySearch.java?region=bounds';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceFind, traceJumps, traceLowerBound } from './binarySearch';

type Method = 'classic' | 'jumps' | 'lower';
const SAMPLE = [1, 2, 4, 4, 5, 7, 9, 10, 12, 15, 18, 20, 21, 25, 27, 30];

export default function BinarySearchViz() {
  const [method, setMethod] = useState<Method>('classic');
  const [raw, setRaw] = useState(SAMPLE);
  const [x, setX] = useState(18);
  const a = useMemo(() => raw.slice().sort((p, q) => p - q), [raw]);
  const frames = useMemo(() => (method === 'classic' ? traceFind(a, x) : method === 'jumps' ? traceJumps(a, x) : traceLowerBound(a, x)), [method, a, x]);
  return (
    <VizShell
      title={{ en: 'Binary search, three ways', hi: 'Binary search, teen tareeke' }}
      controls={<>
        <Segmented label={{ en: 'Method', hi: 'Method' }} value={method} onChange={setMethod}
          options={[{ value: 'classic', label: 'find (halving)' }, { value: 'jumps', label: 'find (jumps)' }, { value: 'lower', label: 'lowerBound' }]} />
        <ArrayInput label={{ en: 'Array (sorted for you)', hi: 'Array (khud sort ho jayega)' }} value={a} onChange={setRaw} min={0} max={99} maxLen={16} />
        <NumberField label="x" value={x} min={-1} max={100} onChange={setX} />
        <ActionButton onClick={() => setRaw(randArray(16, 0, 40))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${method}|${a.join()}|${x}`}
        code={method === 'classic' ? m1 : method === 'jumps' ? m2 : bounds}
        legend={method === 'jumps' ? [L.active, L.jump, L.done] : [L.left, L.active, L.muted, L.done]}
        render={({ state }) => <ArrayView values={state.a} roles={state.roles} ranges={state.ranges} pointers={state.pointers} cell={42} />}
      />
    </VizShell>
  );
}
