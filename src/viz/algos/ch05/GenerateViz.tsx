import { useMemo, useState } from 'react';
import subsetsCode from '@java/ch05/Generate.java?region=subsets';
import bitsCode from '@java/ch05/Generate.java?region=bitmask';
import permCode from '@java/ch05/Generate.java?region=permutations';
import { Player } from '../../engine/Player';
import { NumberField, Segmented, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { HeapTreeView } from '../../views/HeapTreeView';
import { tracePermutations, traceSubsetsBits, traceSubsetsRec } from './generate';

type Mode = 'rec' | 'bits' | 'perm';

export default function GenerateViz({ initial = 'rec' }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [n, setN] = useState(3);
  const frames = useMemo(() => (mode === 'rec' ? traceSubsetsRec(n) : mode === 'bits' ? traceSubsetsBits(n) : tracePermutations(n)), [mode, n]);
  const code = mode === 'rec' ? subsetsCode : mode === 'bits' ? bitsCode : permCode;

  return (
    <VizShell
      title={{ en: 'Generating subsets and permutations', hi: 'Subsets aur permutations generate karna' }}
      controls={<>
        <Segmented label={{ en: 'Generate', hi: 'Generate' }} value={mode} onChange={setMode}
          options={[{ value: 'rec', label: 'subsets (recursion)' }, { value: 'bits', label: 'subsets (bits)' }, { value: 'perm', label: 'permutations' }]} />
        <NumberField label="n" value={n} min={1} max={4} onChange={setN} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${mode}|${n}`}
        code={code}
        legend={mode === 'rec' ? [L.active, L.path, L.done] : mode === 'bits' ? [{ role: 'done', label: { en: 'bit set → element taken', hi: 'bit set → element liya' } }] : [{ role: 'done', label: { en: 'chosen', hi: 'chosen' } }, L.active]}
        render={({ state }) => (
          <div className="stack">
            {state.tree && <HeapTreeView tree={state.tree} n={state.leaves!} roles={state.treeRoles} showIndex={false} />}
            {state.bits && <ArrayView title={{ en: 'bits of b', hi: 'b ke bits' }} values={state.bits} roles={state.bitRoles} indexLabels={state.bits.map((_, p) => `bit ${state.bits!.length - 1 - p}`)} cell={56} />}
            {state.chosen && <ArrayView title="chosen[i]" values={state.chosen} roles={state.chosenRoles} cell={44} />}
            <ArrayView title={mode === 'perm' ? { en: 'current permutation', hi: 'current permutation' } : { en: 'current subset', hi: 'current subset' }} values={state.current.length ? state.current : [null]} hideIndex cell={40} />
            <ArrayView title={{ en: `found so far (${state.found.length})`, hi: `ab tak mile (${state.found.length})` }} values={state.found.length ? state.found : [null]} hideIndex cell={mode === 'perm' ? 72 : 64} />
          </div>
        )}
      />
    </VizShell>
  );
}
