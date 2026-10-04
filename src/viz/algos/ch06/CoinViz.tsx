import { useMemo, useState } from 'react';
import code from '@java/ch06/CoinGreedy.java?region=greedy';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceCoins } from './greedy';

const EURO = [1, 2, 5, 10, 20, 50, 100, 200];

export default function CoinViz() {
  const [coins, setCoins] = useState(EURO);
  const [n, setN] = useState(520);
  const frames = useMemo(() => traceCoins(coins, n), [coins, n]);
  return (
    <VizShell
      title={{ en: 'Greedy coins: when does it work?', hi: 'Greedy coins: kab chalta hai?' }}
      controls={<>
        <ArrayInput label={{ en: 'Coin values', hi: 'Coin values' }} value={coins} onChange={setCoins} min={1} max={500} maxLen={10} />
        <NumberField label={{ en: 'Sum n', hi: 'Sum n' }} value={n} min={1} max={2000} onChange={setN} />
        <ActionButton onClick={() => { setCoins(EURO); setN(520); }} label={{ en: 'Euro coins, 520', hi: 'Euro coins, 520' }} />
        <ActionButton onClick={() => { setCoins([1, 3, 4]); setN(6); }} label={{ en: 'Counterexample {1,3,4}, 6', hi: 'Counterexample {1,3,4}, 6' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${coins.join()}|${n}`}
        code={code}
        legend={[L.compare, L.active]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title={{ en: 'coin values', hi: 'coin values' }} values={state.coins} roles={state.coinRoles} hideIndex cell={52} />
            <ArrayView title={{ en: `greedy takes (remaining ${state.remaining})`, hi: `greedy leta hai (bacha ${state.remaining})` }} values={state.taken.length ? state.taken : [null]} hideIndex cell={52} />
            {state.optimal && <ArrayView title={{ en: 'optimal (dynamic programming)', hi: 'optimal (dynamic programming)' }} values={state.optimal.length ? state.optimal : [null]} roles={Object.fromEntries(state.optimal.map((_, i) => [i, 'done' as const]))} hideIndex cell={52} />}
          </div>
        )}
      />
    </VizShell>
  );
}
