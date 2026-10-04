import { useMemo, useState } from 'react';
import code from '@java/ch10/BitmaskDP.java?region=selection';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { GridView } from '../../views/GridView';
import { setLabel, traceSelection } from './bits';

const BOOK = [[6, 9, 5, 2, 8, 9, 1, 6], [8, 2, 6, 2, 7, 5, 7, 2], [5, 3, 9, 7, 3, 5, 1, 4]];

export default function SelectionViz() {
  const [price, setPrice] = useState(BOOK);
  const frames = useMemo(() => traceSelection(price), [price]);
  const k = price.length, n = price[0].length;
  const days = Array.from({ length: n }, (_, d) => d);
  return (
    <VizShell
      title={{ en: 'Optimal selection: total[S][d]', hi: 'Optimal selection: total[S][d]' }}
      controls={<>
        <ActionButton label={BOOK_EXAMPLE} onClick={() => setPrice(BOOK)} />
        <ActionButton label={RANDOM} onClick={() => setPrice(Array.from({ length: 3 }, () => randArray(6, 1, 9)))} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={price.flat().join()}
        code={code}
        legend={[
          { role: 'changed', label: { en: 'being filled', hi: 'bhara ja raha' } },
          { role: 'compare', label: { en: 'skip today', hi: 'aaj skip' } },
          { role: 'range', label: { en: 'buy today', hi: 'aaj khareedo' } },
          { role: 'path', label: { en: 'walk back', hi: 'peeche ka raasta' } },
          { role: 'done', label: { en: 'bought', hi: 'khareeda' } },
        ]}
        render={({ state }) => (
          <div className="stack">
            <GridView title={{ en: 'price[x][d]', hi: 'price[x][d]' }} rows={price} rowLabels={price.map((_, x) => `product ${x}`)} colLabels={days} roles={state.priceRoles} cell={38} corner="x\d" />
            <GridView
              title={{ en: 'total[S][d]: cheapest way to buy the set S by day d', hi: 'total[S][d]: day d tak set S khareedne ka sabse sasta tareeka' }}
              rows={state.total} rowLabels={Array.from({ length: 1 << k }, (_, s) => setLabel(s, ','))} colLabels={days} roles={state.roles} cell={38} corner="S\d"
            />
          </div>
        )}
      />
    </VizShell>
  );
}
