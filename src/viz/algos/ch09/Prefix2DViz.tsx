import { useMemo, useState } from 'react';
import buildCode from '@java/ch09/PrefixSums.java?region=build2d';
import queryCode from '@java/ch09/PrefixSums.java?region=query2d';
import { Player } from '../../engine/Player';
import { ActionButton, NumberField, Segmented, VizShell, randArray } from '../../engine/controls';
import { GridView } from '../../views/GridView';
import { tracePrefix2DBuild, tracePrefix2DQuery } from './prefixSums';
import { L } from './legends';

const SAMPLE = [
  [3, 1, 4, 1, 5],
  [9, 2, 6, 5, 3],
  [5, 8, 9, 7, 9],
  [3, 2, 3, 8, 4],
];

export default function Prefix2DViz() {
  const [g, setG] = useState(SAMPLE);
  const [op, setOp] = useState<'build' | 'query'>('query');
  const R = g.length, C = g[0].length;
  const [q, setQ] = useState({ r1: 2, c1: 2, r2: 4, c2: 4 });
  const r1 = Math.min(q.r1, R), r2 = Math.min(Math.max(q.r2, r1), R);
  const c1 = Math.min(q.c1, C), c2 = Math.min(Math.max(q.c2, c1), C);

  const frames = useMemo(
    () => (op === 'build' ? tracePrefix2DBuild(g) : tracePrefix2DQuery(g, r1, c1, r2, c2)),
    [g, op, r1, c1, r2, c2],
  );
  const rowsLab = (k: number) => Array.from({ length: k }, (_, i) => i + 1);
  const range = (k: number) => Array.from({ length: k }, (_, i) => i);

  return (
    <VizShell
      title={{ en: '2D prefix sums — S(A) − S(B) − S(C) + S(D)', hi: '2D prefix sums — S(A) − S(B) − S(C) + S(D)' }}
      controls={<>
        <Segmented label={{ en: 'Show', hi: 'Dikhao' }} value={op} onChange={setOp}
          options={[{ value: 'build', label: 'Build' }, { value: 'query', label: 'Query' }]} />
        {op === 'query' && <>
          <NumberField label="r1" value={r1} min={1} max={R} onChange={(v) => setQ({ ...q, r1: v, r2: Math.max(v, q.r2) })} />
          <NumberField label="c1" value={c1} min={1} max={C} onChange={(v) => setQ({ ...q, c1: v, c2: Math.max(v, q.c2) })} />
          <NumberField label="r2" value={r2} min={r1} max={R} onChange={(v) => setQ({ ...q, r2: v })} />
          <NumberField label="c2" value={c2} min={c1} max={C} onChange={(v) => setQ({ ...q, c2: v })} />
        </>}
        <ActionButton onClick={() => setG(Array.from({ length: 4 + Math.floor(Math.random() * 2) }, () => randArray(5, 0, 9)))} label={{ en: 'Random grid', hi: 'Random grid' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${op}|${JSON.stringify(g)}|${r1},${c1},${r2},${c2}`}
        code={op === 'build' ? buildCode : queryCode}
        legend={op === 'build' ? [L.active, L.changed, L.plus, L.minus] : [L.plus, L.minus, L.done]}
        render={({ state }) => (
          <div className="stack row-wrap">
            <GridView title="grid g (1-indexed)" rows={state.g} rowLabels={rowsLab(R)} colLabels={rowsLab(C)} roles={state.gRoles} regions={state.regions} />
            <GridView title="s (prefix sums, with zero border)" rows={state.s} rowLabels={range(R + 1)} colLabels={range(C + 1)} roles={state.sRoles} corner="s" />
          </div>
        )}
      />
    </VizShell>
  );
}
