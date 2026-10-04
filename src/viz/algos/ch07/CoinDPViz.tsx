import { useMemo, useState } from 'react';
import minCode from '@java/ch07/CoinDP.java?region=iterative';
import countCode from '@java/ch07/CoinDP.java?region=count';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, Segmented, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceMinCoins, traceWays } from './dp';

export default function CoinDPViz() {
  const [coins, setCoins] = useState([1, 3, 4]);
  const [n, setN] = useState(10);
  const [mode, setMode] = useState<'min' | 'count'>('min');
  const frames = useMemo(() => (mode === 'min' ? traceMinCoins(coins, n) : traceWays(coins, n)), [coins, n, mode]);
  return (
    <VizShell
      title={{ en: 'Coin problem with dynamic programming', hi: 'Dynamic programming se coin problem' }}
      controls={<>
        <Segmented label={{ en: 'Compute', hi: 'Nikaalo' }} value={mode} onChange={setMode} options={[{ value: 'min', label: { en: 'fewest coins', hi: 'kam se kam coins' } }, { value: 'count', label: { en: 'number of ways', hi: 'kitne tareeke' } }]} />
        <ArrayInput label={{ en: 'Coins', hi: 'Coins' }} value={coins} onChange={setCoins} min={1} max={30} maxLen={6} />
        <NumberField label="n" value={n} min={1} max={20} onChange={setN} />
        <ActionButton onClick={() => { setCoins([1, 3, 4]); setN(10); }} label={{ en: 'Book: {1,3,4}, 10', hi: 'Book: {1,3,4}, 10' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${mode}|${coins.join()}|${n}`}
        code={mode === 'min' ? minCode : countCode}
        legend={[L.compare, L.active, L.changed, L.path]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title={mode === 'min' ? 'value[x]' : 'count[x]'} values={state.values} roles={state.roles} cell={40} />
            {state.first && <ArrayView title="first[x]" values={state.first} roles={state.roles} cell={40} />}
            {state.solution && state.solution.length > 0 && <ArrayView title={{ en: 'an optimal solution', hi: 'ek optimal solution' }} values={state.solution} hideIndex roles={Object.fromEntries(state.solution.map((_, i) => [i, 'done' as const]))} cell={40} />}
          </div>
        )}
      />
    </VizShell>
  );
}
