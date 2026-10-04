import { useMemo, useState } from 'react';
import sumCode from '@java/ch09/FenwickTree.java?region=sum';
import addCode from '@java/ch09/FenwickTree.java?region=add';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { FenwickBars } from '../../views/FenwickBars';
import { traceFenwickAdd, traceFenwickRange, traceFenwickSum } from './fenwick';
import { L } from './legends';

const BOOK = [1, 3, 4, 8, 6, 1, 4, 2];
type Op = 'prefix' | 'range' | 'add';

export default function FenwickViz() {
  const [arr, setArr] = useState(BOOK);
  const [op, setOp] = useState<Op>('prefix');
  const [k, setK] = useState(7);
  const [a, setA] = useState(3);
  const [x, setX] = useState(5);
  const n = arr.length;
  const kk = Math.min(Math.max(k, 1), n);
  const aa = Math.min(Math.max(a, 1), kk);

  const frames = useMemo(() => {
    if (op === 'prefix') return traceFenwickSum(arr, kk);
    if (op === 'range') return traceFenwickRange(arr, aa, kk);
    return traceFenwickAdd(arr, kk, x);
  }, [arr, op, kk, aa, x]);

  return (
    <VizShell
      title={{ en: 'Binary indexed tree (Fenwick tree)', hi: 'Binary indexed tree (Fenwick tree)' }}
      controls={<>
        <Segmented label={{ en: 'Operation', hi: 'Operation' }} value={op} onChange={setOp}
          options={[
            { value: 'prefix', label: 'sum(k)' },
            { value: 'range', label: 'sum(a, b)' },
            { value: 'add', label: 'add(k, x)' },
          ]} />
        <ArrayInput label={{ en: 'Array (1-indexed)', hi: 'Array (1-indexed)' }} value={arr} onChange={setArr} maxLen={16} />
        {op === 'range' && <NumberField label="a" value={aa} min={1} max={kk} onChange={setA} />}
        <NumberField label={op === 'range' ? 'b' : 'k'} value={kk} min={1} max={n} onChange={setK} />
        {op === 'add' && <NumberField label="x" value={x} min={-20} max={20} onChange={setX} />}
        <ActionButton onClick={() => { setArr(BOOK); setK(7); setA(3); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setArr(randArray(8 + Math.floor(Math.random() * 9), 0, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${op}|${arr.join()}|${kk}|${aa}|${x}`}
        code={op === 'add' ? addCode : sumCode}
        legend={op === 'add' ? [L.active, L.changed, L.range] : op === 'range' ? [L.active, L.done, L.minus] : [L.active, L.done, L.range]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="arr" base={1} values={state.arr.slice(1)} roles={Object.fromEntries(Object.entries(state.arrRoles).map(([i, r]) => [Number(i) - 1, r]))} ranges={state.ranges} />
            <FenwickBars tree={state.tree} n={n} roles={state.roles} />
            <ArrayView title="tree" base={1} values={state.tree.slice(1)} roles={Object.fromEntries(Object.entries(state.roles).map(([i, r]) => [Number(i) - 1, r]))} />
          </div>
        )}
      />
    </VizShell>
  );
}
