import { useMemo, useState } from 'react';
import code from '@java/ch07/EditDistance.java?region=distance';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { GridView } from '../../views/GridView';
import { traceEdit } from './dp';

export default function EditDistanceViz() {
  const [x, setX] = useState('LOVE');
  const [y, setY] = useState('MOVIE');
  const [dx, setDx] = useState(x);
  const [dy, setDy] = useState(y);
  const frames = useMemo(() => traceEdit(x, y), [x, y]);
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
  const apply = () => { setX(clean(dx) || 'A'); setY(clean(dy) || 'A'); };
  return (
    <VizShell
      title={{ en: 'Edit distance', hi: 'Edit distance' }}
      controls={<>
        <div className="field"><label htmlFor="ed-x"><T v={{ en: 'From', hi: 'Se' }} ui /></label><input id="ed-x" type="text" value={dx} onChange={(e) => setDx(e.target.value)} onBlur={apply} onKeyDown={(e) => e.key === 'Enter' && apply()} /></div>
        <div className="field"><label htmlFor="ed-y"><T v={{ en: 'To', hi: 'Tak' }} ui /></label><input id="ed-y" type="text" value={dy} onChange={(e) => setDy(e.target.value)} onBlur={apply} onKeyDown={(e) => e.key === 'Enter' && apply()} /></div>
        <ActionButton onClick={() => { setX('LOVE'); setY('MOVIE'); setDx('LOVE'); setDy('MOVIE'); }} label={{ en: 'Book: LOVE → MOVIE', hi: 'Book: LOVE → MOVIE' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${x}|${y}`}
        code={code}
        legend={[L.changed, L.compare, { role: 'done', label: { en: 'match (cost 0)', hi: 'match (cost 0)' } }, { role: 'path', label: { en: 'operations path', hi: 'operations ka path' } }]}
        render={({ state }) => (
          <div className="stack">
            <GridView rows={state.table} rowLabels={['', ...state.x.split('')]} colLabels={['', ...state.y.split('')]} roles={state.roles} cell={40} />
            {state.ops && <p className="ts-result"><T v={{ en: 'Operations:', hi: 'Operations:' }} ui /> <b>{state.ops.length ? state.ops.join(' · ') : 'none'}</b></p>}
          </div>
        )}
      />
    </VizShell>
  );
}
