import { useMemo, useState } from 'react';
import code from '@java/ch05/NQueens.java?region=backtrack';
import { Player } from '../../engine/Player';
import { NumberField, VizShell } from '../../engine/controls';
import { GridView } from '../../views/GridView';
import { traceQueens } from './queens';

export default function QueensViz() {
  const [n, setN] = useState(4);
  const frames = useMemo(() => traceQueens(n), [n]);
  const idx = Array.from({ length: n }, (_, i) => i);
  return (
    <VizShell
      title={{ en: 'Backtracking: n queens', hi: 'Backtracking: n queens' }}
      controls={<NumberField label="n" value={n} min={4} max={6} onChange={setN} />}
    >
      <Player
        frames={frames}
        resetKey={n}
        code={code}
        legend={[
          { role: 'done', label: { en: 'queen', hi: 'queen' } },
          { role: 'active', label: { en: 'safe: placing', hi: 'safe: rakh rahe' } },
          { role: 'minus', label: { en: 'attacked: skip', hi: 'attack mein: skip' } },
          { role: 'muted', label: { en: 'attacked square', hi: 'attack wala square' } },
          { role: 'changed', label: { en: 'just removed', hi: 'abhi hataya' } },
        ]}
        render={({ state }) => <GridView rows={state.board} rowLabels={idx.map((i) => `y${i}`)} colLabels={idx.map((i) => `x${i}`)} roles={state.roles} cell={46} large />}
      />
    </VizShell>
  );
}
