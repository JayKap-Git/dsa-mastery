import { useMemo, useState } from 'react';
import buildCode from '@java/ch09/PrefixSums.java?region=build';
import queryCode from '@java/ch09/PrefixSums.java?region=query';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { tracePrefixBuild, tracePrefixQuery } from './prefixSums';
import { L } from './legends';

const BOOK = [1, 3, 4, 8, 6, 1, 4, 2];

export default function PrefixSumViz() {
  const [arr, setArr] = useState(BOOK);
  const [op, setOp] = useState<'build' | 'query'>('query');
  const [a, setA] = useState(3);
  const [b, setB] = useState(6);
  const n = arr.length;
  const qa = Math.min(a, n - 1), qb = Math.min(Math.max(b, qa), n - 1);

  const frames = useMemo(() => (op === 'build' ? tracePrefixBuild(arr) : tracePrefixQuery(arr, qa, qb)), [arr, op, qa, qb]);

  return (
    <VizShell
      title={{ en: 'Prefix sum array', hi: 'Prefix sum array' }}
      controls={<>
        <Segmented label={{ en: 'Show', hi: 'Dikhao' }} value={op} onChange={setOp}
          options={[{ value: 'build', label: { en: 'Build', hi: 'Build' } }, { value: 'query', label: { en: 'Query', hi: 'Query' } }]} />
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={arr} onChange={setArr} maxLen={14} />
        {op === 'query' && <>
          <NumberField label="a" value={qa} min={0} max={n - 1} onChange={(v) => { setA(v); if (v > b) setB(v); }} />
          <NumberField label="b" value={qb} min={qa} max={n - 1} onChange={setB} />
        </>}
        <ActionButton onClick={() => { setArr(BOOK); setA(3); setB(6); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setArr(randArray(8 + Math.floor(Math.random() * 5), 0, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${op}|${arr.join()}|${qa}|${qb}`}
        code={op === 'build' ? buildCode : queryCode}
        legend={op === 'build' ? [L.active, L.compare, L.changed] : [L.range, L.plus, L.minus, L.done]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="arr" values={state.arr} roles={state.arrRoles} ranges={state.ranges} />
            <ArrayView title="p (prefix sums)" values={state.p} roles={state.pRoles} />
          </div>
        )}
      />
    </VizShell>
  );
}
