import { useMemo, useState } from 'react';
import buildCode from '@java/ch09/SparseTable.java?region=build';
import queryCode from '@java/ch09/SparseTable.java?region=query';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { GridView } from '../../views/GridView';
import { traceSparseBuild, traceSparseQuery } from './sparseTable';
import { L } from './legends';

const BOOK = [1, 3, 4, 8, 6, 1, 4, 2];

export default function SparseTableViz() {
  const [arr, setArr] = useState(BOOK);
  const [op, setOp] = useState<'build' | 'query'>('query');
  const [a, setA] = useState(1);
  const [b, setB] = useState(6);
  const n = arr.length;
  const qa = Math.min(a, n - 1), qb = Math.min(Math.max(b, qa), n - 1);
  const frames = useMemo(() => (op === 'build' ? traceSparseBuild(arr) : traceSparseQuery(arr, qa, qb)), [arr, op, qa, qb]);

  return (
    <VizShell
      title={{ en: 'Sparse table for minimum queries', hi: 'Minimum queries ke liye sparse table' }}
      controls={<>
        <Segmented label={{ en: 'Show', hi: 'Dikhao' }} value={op} onChange={setOp}
          options={[{ value: 'build', label: 'Build' }, { value: 'query', label: 'Query' }]} />
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={arr} onChange={setArr} maxLen={12} />
        {op === 'query' && <>
          <NumberField label="a" value={qa} min={0} max={n - 1} onChange={(v) => { setA(v); if (v > b) setB(v); }} />
          <NumberField label="b" value={qb} min={qa} max={n - 1} onChange={setB} />
        </>}
        <ActionButton onClick={() => { setArr(BOOK); setA(1); setB(6); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setArr(randArray(8 + Math.floor(Math.random() * 4), 0, 20))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${op}|${arr.join()}|${qa}|${qb}`}
        code={op === 'build' ? buildCode : queryCode}
        legend={op === 'build' ? [L.compare, L.changed] : [L.range, L.compare, L.done]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="arr" values={state.arr} roles={state.arrRoles} ranges={state.ranges} />
            <GridView
              title="mn[j][i] = min of arr[i .. i + 2^j − 1]"
              rows={state.table}
              rowLabels={state.table.map((_, j) => `2^${j}`)}
              colLabels={arr.map((_, i) => i)}
              roles={state.tRoles}
              corner="len"
              cell={44}
            />
          </div>
        )}
      />
    </VizShell>
  );
}
