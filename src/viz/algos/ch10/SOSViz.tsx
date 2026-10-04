import { useMemo, useState } from 'react';
import code from '@java/ch10/BitmaskDP.java?region=sos';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { GridView } from '../../views/GridView';
import { setLabel, traceSOS } from './bits';

const BOOK = [3, 1, 4, 5, 5, 1, 3, 3];

export default function SOSViz() {
  const [v, setV] = useState(BOOK);
  const frames = useMemo(() => traceSOS(v), [v]);
  const n = Math.round(Math.log2(v.length));
  return (
    <VizShell
      title={{ en: 'Sum over subsets, one element at a time', hi: 'Sum over subsets, ek-ek element karke' }}
      controls={<>
        <ArrayInput
          label={{ en: 'value[S] for S = 0, 1, 2, … (2, 4, 8 or 16 numbers)', hi: 'value[S], S = 0, 1, 2, … (2, 4, 8 ya 16 numbers)' }} value={v} onChange={setV} min={-99} max={99} minLen={2} maxLen={16}
          validate={(x) => ([2, 4, 8, 16].includes(x.length) ? null : { en: 'Give 2, 4, 8 or 16 numbers (one per subset).', hi: '2, 4, 8 ya 16 numbers do (har subset ka ek).' })}
        />
        <ActionButton label={BOOK_EXAMPLE} onClick={() => setV(BOOK)} />
        <ActionButton label={RANDOM} onClick={() => setV(randArray(8, 0, 9))} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={v.join()}
        code={code}
        legend={[
          { role: 'changed', label: { en: 'sum[S] updated', hi: 'sum[S] update' } },
          { role: 'compare', label: { en: 'keep k', hi: 'k rakho' } },
          { role: 'range', label: { en: 'remove k', hi: 'k hatao' } },
          { role: 'muted', label: { en: 'unchanged (no k in S)', hi: 'nahi badla (S mein k nahi)' } },
          { role: 'done', label: { en: 'final sums', hi: 'final sums' } },
        ]}
        render={({ state }) => (
          <GridView
            rows={state.table}
            rowLabels={['value', ...Array.from({ length: n }, (_, k) => `k = ${k}`)]}
            colLabels={v.map((_, s) => setLabel(s, ','))}
            roles={state.roles}
            cell={56}
            corner="S"
          />
        )}
      />
    </VizShell>
  );
}
