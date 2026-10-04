import { useMemo, useState } from 'react';
import code from '@java/ch07/Tilings.java?region=dp';
import { Player } from '../../engine/Player';
import { ActionButton, BOOK_EXAMPLE, NumberField, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { GridView } from '../../views/GridView';
import { sampleTiling, traceTilings } from './dp';

function Board({ n, m, tiles }: { n: number; m: number; tiles: number[][] }) {
  const S = 34;
  return (
    <svg className="tiling-svg" viewBox={`0 0 ${m * S + 4} ${n * S + 4}`} width={m * S + 4} height={n * S + 4} role="img" aria-label="tiling">
      {tiles.map(([r1, c1, r2, c2], i) => (
        <rect key={i} x={2 + Math.min(c1, c2) * S + 3} y={2 + Math.min(r1, r2) * S + 3} width={(Math.abs(c2 - c1) + 1) * S - 6} height={(Math.abs(r2 - r1) + 1) * S - 6} rx={6} className={r1 === r2 ? 'tile h' : 'tile v'} />
      ))}
    </svg>
  );
}

export default function TilingViz() {
  const [n, setN] = useState(4);
  const [m, setM] = useState(4);
  const [which, setWhich] = useState(0);
  const frames = useMemo(() => traceTilings(n, m), [n, m]);
  const total = frames[frames.length - 1].state.counts[0][n] ?? 0;
  const tiles = useMemo(() => (total ? sampleTiling(n, m, which % total) : null), [n, m, which, total]);
  const resize = (rows: number, cols: number) => { setN(rows); setM(cols); setWhich(0); };
  return (
    <VizShell
      title={{ en: 'Counting domino tilings, row by row', hi: 'Domino tilings ginna, row by row' }}
      controls={<>
        <NumberField label={{ en: 'rows n', hi: 'rows n' }} value={n} min={1} max={8} onChange={(v) => resize(v, m)} />
        <NumberField label={{ en: 'columns m', hi: 'columns m' }} value={m} min={1} max={4} onChange={(v) => resize(n, v)} />
        <ActionButton onClick={() => resize(7, 4)} label={{ en: `${BOOK_EXAMPLE.en}: 4×7 as 7×4`, hi: `${BOOK_EXAMPLE.hi}: 4×7 ko 7×4` }} />
        <ActionButton onClick={() => setWhich((w) => w + 1)} label={{ en: 'Show another tiling', hi: 'Doosra tiling dikhao' }} />
      </>}
    >
      <div className="stage" style={{ paddingBottom: 0 }}>
        {tiles ? <Board n={n} m={m} tiles={tiles} /> : <p className="muted"><T v={{ en: 'No tiling exists: n·m is odd.', hi: 'Koi tiling nahi: n·m odd hai.' }} /></p>}
      </div>
      <Player
        frames={frames}
        resetKey={`${n}|${m}`}
        code={code}
        legend={[L.active, L.changed, { role: 'done', label: { en: 'answer', hi: 'answer' } }]}
        render={({ state }) => (
          <GridView
            title={{ en: 'count[row boundary][state]   (▾ = covered from above)', hi: 'count[row boundary][state]   (▾ = upar se dhaka)' }}
            rows={state.counts}
            rowLabels={state.masks}
            colLabels={Array.from({ length: n + 1 }, (_, r) => `r${r}`)}
            roles={state.roles}
            cell={44}
          />
        )}
      />
    </VizShell>
  );
}
