import { useMemo, useState } from 'react';
import code from '@java/ch07/LIS.java?region=quadratic';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceLIS } from './dp';

const BOOK = [6, 2, 5, 1, 7, 4, 8, 3];

export default function LISViz() {
  const [a, setA] = useState(BOOK);
  const frames = useMemo(() => traceLIS(a), [a]);
  return (
    <VizShell
      title={{ en: 'Longest increasing subsequence', hi: 'Longest increasing subsequence' }}
      controls={<>
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={a} onChange={setA} min={0} max={99} maxLen={10} />
        <ActionButton onClick={() => setA(BOOK)} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(9, 0, 20))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={a.join()}
        code={code}
        legend={[L.active, L.compare, L.muted, L.changed, { role: 'done', label: { en: 'one longest subsequence', hi: 'ek sabse lamba subsequence' } }]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="array" values={state.a} roles={state.roles} />
            <ArrayView title="length[k]" values={state.len} roles={state.lenRoles} />
          </div>
        )}
      />
    </VizShell>
  );
}
