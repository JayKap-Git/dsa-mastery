import { useMemo, useState } from 'react';
import code from '@java/ch09/IndexCompression.java?region=compress';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, BOOK_EXAMPLE } from '../../engine/controls';
import { ArrayView } from '../../views/ArrayView';
import { traceCompress } from './rangeUpdates';
import { L } from './legends';

const BOOK = [555, 1_000_000_000, 8];
const SAMPLE = [70000, 30, 999999, 30, 512, 70000];

export default function CompressViz() {
  const [xs, setXs] = useState(SAMPLE);
  const frames = useMemo(() => traceCompress(xs), [xs]);
  return (
    <VizShell
      title={{ en: 'Index compression', hi: 'Index compression' }}
      controls={<>
        <ArrayInput label={{ en: 'Values', hi: 'Values' }} value={xs} onChange={setXs} min={0} max={1_000_000_000} maxLen={10} />
        <ActionButton onClick={() => setXs(BOOK)} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setXs(SAMPLE)} label={{ en: 'With duplicates', hi: 'Duplicates ke saath' }} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={xs.join()}
        code={code}
        legend={[L.active, L.compare, L.range]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title={{ en: 'original values x', hi: 'original values x' }} values={state.xs} roles={state.xsRoles} cell={96} />
            {state.sorted && (
              <ArrayView title={{ en: 'sorted distinct values (rank = position + 1)', hi: 'sorted distinct values (rank = position + 1)' }} values={state.sorted} roles={state.sortedRoles} indexLabels={state.sorted.map((_, i) => `rank ${i + 1}`)} cell={96} />
            )}
            <ArrayView title="c(x)" values={state.c} roles={state.xsRoles} cell={96} />
          </div>
        )}
      />
    </VizShell>
  );
}
