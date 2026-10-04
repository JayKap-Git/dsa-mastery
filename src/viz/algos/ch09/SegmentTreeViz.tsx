import { useMemo, useState } from 'react';
import sumClass from '@java/ch09/SegmentTree.java?region=class';
import sumQuery from '@java/ch09/SegmentTree.java?region=sum';
import sumAdd from '@java/ch09/SegmentTree.java?region=add';
import minClass from '@java/ch09/MinSegmentTree.java?region=class';
import minQuery from '@java/ch09/MinSegmentTree.java?region=min';
import minSet from '@java/ch09/MinSegmentTree.java?region=set';
import minArg from '@java/ch09/MinSegmentTree.java?region=argmin';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { HeapTreeView } from '../../views/HeapTreeView';
import { traceArgmin, traceSegBuild, traceSegQuery, traceSegUpdate, type Kind } from './segmentTree';
import { L } from './legends';

const BOOK_SUM = [5, 8, 6, 3, 2, 7, 2, 6];
const BOOK_MIN = [5, 8, 6, 3, 1, 7, 2, 6];
type Op = 'build' | 'query' | 'update' | 'argmin';
const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

export default function SegmentTreeViz({ initialKind = 'sum' }: { initialKind?: Kind }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [arr, setArr] = useState(initialKind === 'sum' ? BOOK_SUM : BOOK_MIN);
  const [op, setOp] = useState<Op>('query');
  const [a, setA] = useState(2);
  const [b, setB] = useState(7);
  const [k, setK] = useState(5);
  const [x, setX] = useState(3);
  const n = arr.length;
  const qa = Math.min(a, n - 1), qb = Math.min(Math.max(b, qa), n - 1), kk = Math.min(k, n - 1);
  const effOp: Op = kind === 'sum' && op === 'argmin' ? 'query' : op;

  const frames = useMemo(() => {
    if (effOp === 'build') return traceSegBuild(kind, arr);
    if (effOp === 'query') return traceSegQuery(kind, arr, qa, qb);
    if (effOp === 'update') return traceSegUpdate(kind, arr, kk, x);
    return traceArgmin(arr);
  }, [kind, arr, effOp, qa, qb, kk, x]);

  const code = kind === 'sum'
    ? { build: sumClass, query: sumQuery, update: sumAdd, argmin: sumQuery }[effOp]
    : { build: minClass, query: minQuery, update: minSet, argmin: minArg }[effOp];

  const switchKind = (v: Kind) => {
    setKind(v);
    if (arr.join() === BOOK_SUM.join() || arr.join() === BOOK_MIN.join()) setArr(v === 'sum' ? BOOK_SUM : BOOK_MIN);
  };

  const ops = [
    { value: 'build' as const, label: 'build' },
    { value: 'query' as const, label: kind === 'sum' ? 'sum(a, b)' : 'min(a, b)' },
    { value: 'update' as const, label: kind === 'sum' ? 'add(k, x)' : 'set(k, x)' },
    ...(kind === 'min' ? [{ value: 'argmin' as const, label: 'argmin()' }] : []),
  ];

  return (
    <VizShell
      title={{ en: 'Segment tree (bottom-up)', hi: 'Segment tree (bottom-up)' }}
      controls={<>
        <Segmented label={{ en: 'Tree stores', hi: 'Tree mein' }} value={kind} onChange={switchKind}
          options={[{ value: 'sum', label: 'sum' }, { value: 'min', label: 'min' }]} />
        <Segmented label={{ en: 'Operation', hi: 'Operation' }} value={effOp} onChange={setOp} options={ops} />
        <ArrayInput
          label={{ en: 'Array (length 1, 2, 4, 8 or 16)', hi: 'Array (length 1, 2, 4, 8 ya 16)' }}
          value={arr} onChange={setArr} maxLen={16}
          validate={(v) => (isPow2(v.length) ? null : { en: 'Length must be a power of two — pad with zeros.', hi: 'Length power of two honi chahiye — zeros se pad kar do.' })}
        />
        {effOp === 'query' && <>
          <NumberField label="a" value={qa} min={0} max={n - 1} onChange={(v) => { setA(v); if (v > b) setB(v); }} />
          <NumberField label="b" value={qb} min={qa} max={n - 1} onChange={setB} />
        </>}
        {effOp === 'update' && <>
          <NumberField label="k" value={kk} min={0} max={n - 1} onChange={setK} />
          <NumberField label="x" value={x} min={-20} max={20} onChange={setX} />
        </>}
        <ActionButton onClick={() => { setArr(kind === 'sum' ? BOOK_SUM : BOOK_MIN); setA(2); setB(7); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setArr(randArray(Math.random() < 0.5 ? 8 : 16, 0, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${kind}|${effOp}|${arr.join()}|${qa}|${qb}|${kk}|${x}`}
        code={code}
        legend={effOp === 'query' ? [L.range, L.active, L.compare, L.done] : effOp === 'update' ? [L.changed, L.compare, L.path] : effOp === 'argmin' ? [L.path, L.compare, L.done] : [L.compare, L.changed]}
        render={({ state }) => (
          <div className="stack">
            <HeapTreeView tree={state.tree} n={state.n} roles={state.roles} badges={state.badges} leafLabel={(i) => `arr[${i}]`} />
            <ArrayView
              title={{ en: 'stored as one array: tree[1 .. 2n−1]', hi: 'ek hi array mein stored: tree[1 .. 2n−1]' }}
              values={state.tree.slice(1)}
              base={1}
              roles={Object.fromEntries(Object.entries(state.roles).map(([i, r]) => [Number(i) - 1, r]))}
              cell={state.n > 8 ? 34 : 40}
            />
          </div>
        )}
      />
    </VizShell>
  );
}
