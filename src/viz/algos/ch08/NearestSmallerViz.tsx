import { useMemo, useState } from 'react';
import code from '@java/ch08/NearestSmaller.java?region=stack';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { ArrayView } from '../../views/ArrayView';
import { BarsView } from '../../views/BarsView';
import { traceNearestSmaller } from './amortized';

const BOOK = [1, 3, 4, 2, 5, 3, 4, 2];

export default function NearestSmallerViz() {
  const [a, setA] = useState(BOOK);
  const frames = useMemo(() => traceNearestSmaller(a), [a]);
  const top = Math.max(2, ...frames[frames.length - 1].state.work);
  return (
    <VizShell
      title={{ en: 'Nearest smaller elements with a stack', hi: 'Stack se nearest smaller elements' }}
      controls={<>
        <ArrayInput label={{ en: 'Array', hi: 'Array' }} value={a} onChange={setA} min={0} max={99} maxLen={10} />
        <ActionButton onClick={() => setA(BOOK)} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setA(randArray(9, 1, 9))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={a.join()}
        code={code}
        legend={[
          L.active,
          { role: 'range', label: { en: 'on the stack', hi: 'stack pe' } },
          { role: 'minus', label: { en: 'popped', hi: 'pop hua' } },
          L.changed,
          { role: 'done', label: { en: 'nearest smaller', hi: 'nearest smaller' } },
        ]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title="array" values={state.a} roles={state.roles} />
            <ArrayView
              title={{ en: 'stack, bottom → top (values; positions above)', hi: 'stack, neeche → upar (values; upar positions)' }}
              values={state.stack.length ? state.stack.map((p) => state.a[p]) : [null]}
              indexLabels={state.stack.length ? state.stack.map((p) => `@${p}`) : ['']}
              roles={state.stackRoles}
            />
            <ArrayView title={{ en: 'nearest smaller value', hi: 'nearest smaller value' }} values={state.answer} roles={state.answerRoles} />
            <div className="arr">
              <div className="arr-title"><T v={{ en: 'stack operations at each position: uneven, but never more than 2n in total', hi: 'har position pe stack operations: kam-zyada, par total kabhi 2n se zyada nahi' }} ui /></div>
              <BarsView values={state.work} max={top} height={110} />
            </div>
          </div>
        )}
      />
    </VizShell>
  );
}
