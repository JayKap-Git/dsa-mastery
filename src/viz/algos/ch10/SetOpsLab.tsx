import { useState } from 'react';
import { ActionButton, VizShell } from '../../engine/controls';
import { T } from '../../engine/T';
import { BitTable, type BitRowSpec } from '../../views/BitTable';
import { popcount, setLabel } from './bits';

const N = 10;
const FULL = (1 << N) - 1;
const BOOK_A = (1 << 1) | (1 << 3) | (1 << 4) | (1 << 8); // {1, 3, 4, 8} = 282
const BOOK_B = (1 << 3) | (1 << 6) | (1 << 8) | (1 << 9); // {3, 6, 8, 9}

/** Two subsets of {0..9} as ints; click bits to add or remove elements. */
export default function SetOpsLab() {
  const [a, setA] = useState(BOOK_A);
  const [b, setB] = useState(BOOK_B);
  const rows: BitRowSpec[] = [
    { label: 'a', value: a, note: `${setLabel(a)} = ${a}`, onToggle: (i) => setA(a ^ (1 << i)) },
    { label: 'b', value: b, note: `${setLabel(b)} = ${b}`, onToggle: (i) => setB(b ^ (1 << i)) },
    { label: 'a & b', value: a & b, note: `a ∩ b = ${setLabel(a & b)}`, sep: true },
    { label: 'a | b', value: a | b, note: `a ∪ b = ${setLabel(a | b)}` },
    { label: 'a & ~b', value: a & ~b, note: `a \\ b = ${setLabel(a & ~b)}` },
    { label: `~a & ${FULL}`, value: ~a & FULL, note: `complement of a = ${setLabel(~a & FULL)}` },
  ];
  return (
    <VizShell
      title={{ en: 'Sets as bits: union, intersection, difference', hi: 'Bits wale sets: union, intersection, difference' }}
      controls={<>
        <ActionButton label={{ en: 'Book sets', hi: 'Book wale sets' }} onClick={() => { setA(BOOK_A); setB(BOOK_B); }} />
        <ActionButton label={{ en: 'Clear both', hi: 'Dono khaali' }} onClick={() => { setA(0); setB(0); }} />
      </>}
    >
      <div className="stage">
        <BitTable rows={rows} width={N} title={{ en: 'bit i = element i of {0, …, 9}; click to add or remove', hi: 'bit i = {0, …, 9} ka element i; click karke jodo ya hatao' }} />
        <div className="lab-facts">
          <span>Integer.bitCount(a) = <b>{popcount(a)}</b></span>
          <span>Integer.bitCount(a | b) = <b>{popcount(a | b)}</b></span>
          <span><T v={{ en: 'b ⊆ a?', hi: 'b ⊆ a?' }} ui /> (b & ~a) == 0 → <b>{String((b & ~a) === 0)}</b></span>
        </div>
      </div>
    </VizShell>
  );
}
