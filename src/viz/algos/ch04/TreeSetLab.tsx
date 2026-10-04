import { useState } from 'react';
import { ActionButton, NumberField, VizShell } from '../../engine/controls';
import { Legend } from '../../engine/Legend';
import { T } from '../../engine/T';
import { ArrayView } from '../../views/ArrayView';
import { insertSorted, insertionPoint, navigate, removeValue, type Query } from './treeset';

const BOOK = [3, 4, 6, 8, 12, 13, 14, 17];
const QUERIES: { q: Query; call: string; means: { en: string; hi: string } }[] = [
  { q: 'ceiling', call: 'ceiling', means: { en: 'smallest ≥ x (C++ lower_bound)', hi: 'x se bada-ya-barabar sabse chhota (C++ lower_bound)' } },
  { q: 'higher', call: 'higher', means: { en: 'smallest > x (C++ upper_bound)', hi: 'x se bada sabse chhota (C++ upper_bound)' } },
  { q: 'floor', call: 'floor', means: { en: 'largest ≤ x', hi: 'x se chhota-ya-barabar sabse bada' } },
  { q: 'lower', call: 'lower', means: { en: 'largest < x', hi: 'x se chhota sabse bada' } },
  { q: 'nearest', call: 'nearest', means: { en: 'closest to x (CollectionsTour.nearest)', hi: 'x ke sabse paas (CollectionsTour.nearest)' } },
  { q: 'contains', call: 'contains', means: { en: 'is x in the set?', hi: 'kya x set mein hai?' } },
];

/** A TreeSet you can poke: every navigation call, its answer, and where x would go. */
export default function TreeSetLab() {
  const [s, setS] = useState(BOOK);
  const [x, setX] = useState(10);
  const [q, setQ] = useState<Query>('ceiling');
  const idx = navigate(s, x, q);
  const ip = insertionPoint(s, x);
  const result = q === 'contains' ? String(idx >= 0) : idx < 0 ? 'null' : String(s[idx]);
  const call = q === 'nearest' ? `nearest(set, ${x})` : `set.${q}(${x})`;

  return (
    <VizShell
      title={{ en: 'TreeSet navigation lab', hi: 'TreeSet navigation lab' }}
      controls={<>
        <NumberField label="x" value={x} min={-99} max={999} onChange={setX} />
        <ActionButton onClick={() => setS(insertSorted(s, x))} label={{ en: `add(${x})`, hi: `add(${x})` }} />
        <ActionButton onClick={() => setS(removeValue(s, x))} label={{ en: `remove(${x})`, hi: `remove(${x})` }} />
        <ActionButton onClick={() => setS(BOOK)} label={{ en: 'Book set', hi: 'Book wala set' }} />
      </>}
    >
      <div className="stage">
        <Legend items={[{ role: 'done', label: { en: 'answer', hi: 'answer' } }]} />
        <div className="ts-queries" role="radiogroup" aria-label="Query">
          {QUERIES.map((d) => (
            <button key={d.q} type="button" role="radio" aria-checked={q === d.q} className={q === d.q ? 'on' : ''} onClick={() => setQ(d.q)}>
              <code>{d.call}</code><small><T v={d.means} ui /></small>
            </button>
          ))}
        </div>
        <ArrayView
          title={{ en: `TreeSet<Integer> (${s.length} elements, kept sorted)`, hi: `TreeSet<Integer> (${s.length} elements, hamesha sorted)` }}
          values={s.length ? s : [null]}
          hideIndex
          roles={idx >= 0 && q !== 'contains' ? { [idx]: 'done' } : q === 'contains' && idx >= 0 ? { [idx]: 'done' } : {}}
          pointers={s.length ? [{ at: Math.min(ip, s.length - 1), label: ip === s.length ? `x→` : `x=${x}` }] : []}
          cell={52}
        />
        <p className="ts-result"><code>{call}</code> → <b>{result}</b></p>
        <p className="muted"><T v={{ en: 'Every call is O(log n) on a TreeSet. A HashSet can only answer contains/add/remove, but in O(1) on average.', hi: 'TreeSet pe har call O(log n). HashSet sirf contains/add/remove kar sakta hai, par average O(1) mein.' }} /></p>
      </div>
    </VizShell>
  );
}
