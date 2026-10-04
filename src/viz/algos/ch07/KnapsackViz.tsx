import { useMemo, useState } from 'react';
import code from '@java/ch07/Knapsack.java?region=table';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, BOOK_EXAMPLE } from '../../engine/controls';
import { L } from '../../engine/legends';
import { GridView } from '../../views/GridView';
import { traceKnapsack } from './dp';

const BOOK = [1, 3, 3, 5];

export default function KnapsackViz() {
  const [w, setW] = useState(BOOK);
  const frames = useMemo(() => traceKnapsack(w), [w]);
  const W = w.reduce((s, v) => s + v, 0);
  return (
    <VizShell
      title={{ en: 'Knapsack: which sums are possible?', hi: 'Knapsack: kaunse sums ban sakte hain?' }}
      controls={<>
        <ArrayInput label={{ en: 'Weights (total ≤ 20)', hi: 'Weights (total ≤ 20)' }} value={w} onChange={setW} min={1} max={10} maxLen={6} validate={(v) => (v.reduce((s, x) => s + x, 0) <= 20 ? null : { en: 'Keep the total at most 20.', hi: 'Total 20 se zyada mat rakho.' })} />
        <ActionButton onClick={() => setW(BOOK)} label={BOOK_EXAMPLE} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={w.join()}
        code={code}
        legend={[L.changed, { role: 'compare', label: { en: 'from: use weight k', hi: 'yahan se: weight k use' } }, { role: 'range', label: { en: 'from: skip weight k', hi: 'yahan se: weight k skip' } }]}
        render={({ state }) => (
          <GridView
            title={{ en: 'possible[k][x] (rows: first k weights, columns: sum x)', hi: 'possible[k][x] (rows: pehle k weights, columns: sum x)' }}
            rows={state.table}
            rowLabels={state.table.map((_, k) => (k === 0 ? 'k=0' : `+${state.weights[k - 1]}`))}
            colLabels={Array.from({ length: W + 1 }, (_, x) => x)}
            roles={state.roles}
            cell={34}
            corner="k\x"
          />
        )}
      />
    </VizShell>
  );
}
