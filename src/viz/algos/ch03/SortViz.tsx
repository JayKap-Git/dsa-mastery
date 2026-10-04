import { useMemo, useState } from 'react';
import bubbleCode from '@java/ch03/SortingAlgorithms.java?region=bubble';
import mergeCode from '@java/ch03/SortingAlgorithms.java?region=merge';
import countingCode from '@java/ch03/SortingAlgorithms.java?region=counting';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, Segmented, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { BarsView } from '../../views/BarsView';
import { traceBubble, traceCounting, traceMerge } from './sorting';

type Algo = 'bubble' | 'merge' | 'counting';
const BOOK: Record<Algo, number[]> = {
  bubble: [1, 3, 8, 2, 9, 2, 5, 6],
  merge: [1, 3, 6, 2, 8, 2, 5, 9],
  counting: [1, 3, 6, 9, 9, 3, 5, 9],
};

export default function SortViz() {
  const [algo, setAlgo] = useState<Algo>('merge');
  const [a, setA] = useState(BOOK.merge);
  const frames = useMemo(() => (algo === 'bubble' ? traceBubble(a) : algo === 'merge' ? traceMerge(a) : traceCounting(a)), [algo, a]);
  const code = algo === 'bubble' ? bubbleCode : algo === 'merge' ? mergeCode : countingCode;

  return (
    <VizShell
      title={{ en: 'Sorting: O(n²) vs O(n log n) vs O(n + c)', hi: 'Sorting: O(n²) vs O(n log n) vs O(n + c)' }}
      controls={<>
        <Segmented label={{ en: 'Algorithm', hi: 'Algorithm' }} value={algo} onChange={(v) => { setAlgo(v); setA(BOOK[v]); }}
          options={[{ value: 'bubble', label: 'bubble' }, { value: 'merge', label: 'merge' }, { value: 'counting', label: 'counting' }]} />
        <ArrayInput label={{ en: 'Array (values 0–20)', hi: 'Array (values 0–20)' }} value={a} onChange={setA} min={0} max={20} maxLen={algo === 'bubble' ? 9 : 12} />
        <ActionButton onClick={() => setA(BOOK[algo])} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(8, 0, 12))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${algo}|${a.join()}`}
        code={code}
        legend={algo === 'bubble' ? [L.compare, L.changed, L.sorted] : algo === 'merge' ? [L.left, L.right, L.active, L.changed, L.sorted] : [L.active, L.changed, L.compare, L.sorted]}
        render={({ state }) => (
          <div className="stack">
            <BarsView values={state.a} roles={state.roles} ranges={state.ranges} pointers={state.pointers} max={Math.max(1, ...a)} height={140} />
            {state.aux && (
              <ArrayView
                title={algo === 'merge' ? 'tmp' : { en: 'count[v] (bookkeeping array)', hi: 'count[v] (bookkeeping array)' }}
                values={state.aux}
                roles={state.auxRoles}
                base={state.auxBase ?? 0}
                cell={40}
              />
            )}
          </div>
        )}
      />
    </VizShell>
  );
}
