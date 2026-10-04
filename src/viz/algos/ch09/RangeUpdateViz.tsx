import { useMemo, useState } from 'react';
import diffCode from '@java/ch09/RangeUpdates.java?region=diff';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { traceDifference, traceRangeAdd } from './rangeUpdates';
import { L } from './legends';

const BOOK = [3, 3, 1, 1, 1, 5, 2, 2];

export default function RangeUpdateViz() {
  const [arr, setArr] = useState(BOOK);
  const [op, setOp] = useState<'diff' | 'update'>('update');
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  const [x, setX] = useState(5);
  const n = arr.length;
  const qa = Math.min(a, n - 1), qb = Math.min(Math.max(b, qa), n - 1);
  const frames = useMemo(() => (op === 'diff' ? traceDifference(arr) : traceRangeAdd(arr, qa, qb, x)), [arr, op, qa, qb, x]);

  return (
    <VizShell
      title={{ en: 'Difference array: range update in O(1)', hi: 'Difference array: range update O(1) mein' }}
      controls={<>
        <Segmented label={{ en: 'Show', hi: 'Dikhao' }} value={op} onChange={setOp}
          options={[{ value: 'diff', label: { en: 'Build d', hi: 'd banao' } }, { value: 'update', label: { en: 'Range add', hi: 'Range add' } }]} />
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={arr} onChange={setArr} maxLen={14} />
        {op === 'update' && <>
          <NumberField label="a" value={qa} min={0} max={n - 1} onChange={(v) => { setA(v); if (v > b) setB(v); }} />
          <NumberField label="b" value={qb} min={qa} max={n - 1} onChange={setB} />
          <NumberField label="x" value={x} min={-20} max={20} onChange={setX} />
        </>}
        <ActionButton onClick={() => { setArr(BOOK); setA(1); setB(4); setX(5); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setArr(randArray(8 + Math.floor(Math.random() * 4), 0, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${op}|${arr.join()}|${qa}|${qb}|${x}`}
        code={diffCode}
        legend={op === 'diff' ? [L.active, L.compare, L.changed] : [L.range, L.plus, L.minus, L.changed]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="arr" values={state.arr} roles={state.arrRoles} ranges={state.ranges} />
            <ArrayView title={{ en: 'd (difference array)', hi: 'd (difference array)' }} values={state.d} roles={state.dRoles} />
          </div>
        )}
      />
    </VizShell>
  );
}
