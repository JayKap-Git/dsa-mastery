import { useEffect, useId, useMemo, useState } from 'react';
import code from '@java/ch10/BitOptimizations.java?region=hamming';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell, BOOK_EXAMPLE, RANDOM } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { BitTable } from '../../views/BitTable';
import { traceHamming } from './bits';

const BOOK = ['00111', '01101', '11110'];
const rand = () => {
  const k = 6;
  return Array.from({ length: 5 }, () => Array.from({ length: k }, () => (Math.random() < 0.5 ? '0' : '1')).join(''));
};

export default function HammingViz() {
  const id = useId();
  const [list, setList] = useState(BOOK);
  const [draft, setDraft] = useState(BOOK.join(', '));
  const [bad, setBad] = useState(false);
  useEffect(() => setDraft(list.join(', ')), [list]);
  const apply = () => {
    const parts = draft.split(/[\s,]+/).filter(Boolean);
    const ok = parts.length >= 2 && parts.length <= 6 && parts.every((p) => /^[01]{1,10}$/.test(p)) && parts.every((p) => p.length === parts[0].length);
    setBad(!ok);
    if (ok && parts.join() !== list.join()) setList(parts);
  };
  const frames = useMemo(() => traceHamming(list), [list]);
  return (
    <VizShell
      title={{ en: 'Hamming distance with xor and bitCount', hi: 'Xor aur bitCount se Hamming distance' }}
      controls={<>
        <div className="field grow">
          <label htmlFor={id}><T v={{ en: 'Bit strings (2–6, same length ≤ 10)', hi: 'Bit strings (2–6, same length ≤ 10)' }} ui /></label>
          <input id={id} type="text" value={draft} spellCheck={false} aria-invalid={bad} onChange={(e) => setDraft(e.target.value)} onBlur={apply} onKeyDown={(e) => e.key === 'Enter' && apply()} />
          {bad && <span className="field-err" role="alert"><T v={{ en: 'Use 2–6 strings of 0s and 1s, all the same length (≤ 10).', hi: '0 aur 1 ki 2–6 strings daalo, sab same length (≤ 10).' }} /></span>}
        </div>
        <ActionButton label={BOOK_EXAMPLE} onClick={() => setList(BOOK)} />
        <ActionButton label={RANDOM} onClick={() => setList(rand())} />
      </>}
    >
      <Player
        frames={frames}
        resetKey={list.join()}
        code={code}
        legend={[{ role: 'changed', label: { en: 'the strings differ here', hi: 'yahan strings alag' } }, { role: 'done', label: { en: 'closest pair', hi: 'sabse paas wala pair' } }, L.active]}
        render={({ state }) => <BitTable rows={state.rows} width={list[0].length} />}
      />
    </VizShell>
  );
}
