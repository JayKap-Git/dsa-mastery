import { useMemo, useState } from 'react';
import code from '@java/ch05/MeetInTheMiddle.java?region=mitm';
import { Player } from '../../engine/Player';
import { ActionButton, ArrayInput, NumberField, VizShell, randArray, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { ArrayView } from '../../views/ArrayView';
import { traceMitm } from './mitm';

const BOOK = [2, 4, 5, 9];

export default function MitmViz() {
  const [list, setList] = useState(BOOK);
  const [x, setX] = useState(15);
  const frames = useMemo(() => traceMitm(list, x), [list, x]);
  return (
    <VizShell
      title={{ en: 'Meet in the middle: subset sum', hi: 'Meet in the middle: subset sum' }}
      controls={<>
        <ArrayInput label={{ en: 'Numbers (up to 8)', hi: 'Numbers (8 tak)' }} value={list} onChange={setList} min={0} max={50} maxLen={8} />
        <NumberField label="x" value={x} min={0} max={400} onChange={setX} />
        <ActionButton onClick={() => { setList(BOOK); setX(15); }} label={BOOK_EXAMPLE} />
        <ActionButton onClick={() => setList(randArray(6, 1, 20))} label={RANDOM} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={`${list.join()}|${x}`}
        code={code}
        legend={[L.active, L.compare, L.done]}
        render={({ state }) => (
          <div className="stack">
            <ArrayView title={{ en: 'the list, split in half', hi: 'list, aadhi-aadhi' }} values={state.list} ranges={state.listRanges} />
            {state.sa && <ArrayView title="S_A (sorted subset sums of A)" values={state.sa} roles={state.saRoles} pointers={state.saPtr} cell={46} />}
            {state.sb && <ArrayView title="S_B (sorted subset sums of B)" values={state.sb} roles={state.sbRoles} pointers={state.sbPtr} cell={46} />}
          </div>
        )}
      />
    </VizShell>
  );
}
