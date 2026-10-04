import { useMemo, useState } from 'react';
import code from '@java/ch07/GridPathSum.java?region=maxsum';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { GridView } from '../../views/GridView';
import { traceGridSum } from './dp';

const BOOK = [[3, 7, 9, 2, 7], [9, 8, 3, 5, 5], [1, 7, 9, 8, 5], [3, 8, 6, 4, 10], [6, 3, 9, 7, 8]];
const lab = (k: number) => Array.from({ length: k }, (_, i) => i + 1);

export default function GridDPViz() {
  const [g, setG] = useState(BOOK);
  const frames = useMemo(() => traceGridSum(g), [g]);
  return (
    <VizShell
      title={{ en: 'Paths in a grid: best sum', hi: 'Grid mein paths: best sum' }}
      controls={<>
        <ActionButton onClick={() => setG(BOOK)} label={{ en: 'Book grid', hi: 'Book wala grid' }} />
        <ActionButton onClick={() => setG(Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 9))))} label={{ en: 'Random grid', hi: 'Random grid' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={JSON.stringify(g)}
        code={code}
        legend={[L.active, L.compare, L.changed, { role: 'path', label: { en: 'best path', hi: 'best path' } }]}
        render={({ state }) => (
          <div className="stack row-wrap">
            <GridView title="value[y][x]" rows={state.value} rowLabels={lab(g.length)} colLabels={lab(g[0].length)} roles={state.vRoles} />
            <GridView title="sum[y][x]" rows={state.sum} rowLabels={lab(g.length)} colLabels={lab(g[0].length)} roles={state.sRoles} />
          </div>
        )}
      />
    </VizShell>
  );
}
