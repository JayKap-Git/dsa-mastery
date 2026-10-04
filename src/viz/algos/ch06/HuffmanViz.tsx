import { useMemo, useState } from 'react';
import code from '@java/ch06/Huffman.java?region=build';
import { Player } from '../../engine/Player';
import { ActionButton, VizShell } from '../../engine/controls';
import { L } from '../../engine/legends';
import { T } from '../../engine/T';
import { BinaryTreeView } from '../../views/BinaryTreeView';
import { traceHuffman } from './greedy';

export default function HuffmanViz() {
  const [s, setS] = useState('AABACDACA');
  const [draft, setDraft] = useState(s);
  const frames = useMemo(() => traceHuffman(s), [s]);
  const apply = () => { const t = draft.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 24); if (t) setS(t); };
  return (
    <VizShell
      title={{ en: 'Huffman coding', hi: 'Huffman coding' }}
      controls={<>
        <div className="field grow">
          <label htmlFor="hf-s"><T v={{ en: 'Text (A–Z, up to 24 letters)', hi: 'Text (A–Z, 24 letters tak)' }} ui /></label>
          <input id="hf-s" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={apply} onKeyDown={(e) => e.key === 'Enter' && apply()} spellCheck={false} />
        </div>
        <ActionButton onClick={() => { setS('AABACDACA'); setDraft('AABACDACA'); }} label={{ en: 'Book example', hi: 'Book wala example' }} />
        <ActionButton onClick={() => { setS('ABRACADABRA'); setDraft('ABRACADABRA'); }} label="ABRACADABRA" />
      </>}
    >
      <Player
        frames={frames}
        resetKey={s}
        code={code}
        legend={[L.compare, L.changed]}
        render={({ state }) => (
          <div className="stack">
            <BinaryTreeView roots={state.forest} roles={state.roles} />
            {state.codes && (
              <div className="cx lab" style={{ maxWidth: 360 }}><table>
                <thead><tr><th>char</th><th>codeword</th></tr></thead>
                <tbody>{state.codes.map(([c, w]) => <tr key={c}><td><b>{c}</b></td><td>{w}</td></tr>)}</tbody>
              </table></div>
            )}
          </div>
        )}
      />
    </VizShell>
  );
}
