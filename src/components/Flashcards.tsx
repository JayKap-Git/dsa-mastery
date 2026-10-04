import { useMemo, useState } from 'react';
import type { Flashcard } from '../data/types';
import { T } from '../viz/engine/T';

interface Card extends Flashcard { tag?: string }

export default function Flashcards({ cards }: { cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const deck = useMemo(() => order.filter((i) => !known.has(i)), [order, known]);

  if (cards.length === 0) return null;
  if (deck.length === 0)
    return (
      <div className="flash">
        <p className="center"><T v={{ en: `All ${cards.length} cards known. Nice work!`, hi: `Saare ${cards.length} cards yaad ho gaye. Badhiya!` }} /></p>
        <div className="flash-bar"><span className="grow" /><button type="button" className="btn-ghost" onClick={() => { setKnown(new Set()); setPos(0); }}><T v={{ en: 'Start over', hi: 'Phir se shuru' }} ui /></button></div>
      </div>
    );

  const i = deck[pos % deck.length];
  const card = cards[i];
  const next = () => { setFlipped(false); setPos((p) => (p + 1) % deck.length); };

  return (
    <div className="flash">
      <button type="button" className={`flash-card${flipped ? ' back' : ''}`} onClick={() => setFlipped((f) => !f)} aria-live="polite">
        <span>
          <span className="face-label">{flipped ? <T v={{ en: 'Answer', hi: 'Jawab' }} ui /> : <T v={{ en: 'Question — tap to flip', hi: 'Sawaal — palatne ke liye tap karo' }} ui />}{card.tag ? ` · ${card.tag}` : ''}</span>
          <T v={flipped ? card.back : card.front} />
        </span>
      </button>
      <div className="flash-bar">
        <span>{deck.length} <T v={{ en: 'left', hi: 'baaki' }} ui /></span>
        <span className="grow" />
        <button type="button" className="btn-ghost" onClick={() => { setOrder((o) => [...o].sort(() => Math.random() - 0.5)); setPos(0); setFlipped(false); }}>
          <T v={{ en: 'Shuffle', hi: 'Shuffle' }} ui />
        </button>
        <button type="button" className="btn-ghost" onClick={next}><T v={{ en: 'Not yet', hi: 'Abhi nahi' }} ui /></button>
        <button type="button" className="btn-ghost" onClick={() => { setKnown((k) => new Set(k).add(i)); setFlipped(false); }}>
          <T v={{ en: 'I know this', hi: 'Yeh aata hai' }} ui />
        </button>
      </div>
    </div>
  );
}
