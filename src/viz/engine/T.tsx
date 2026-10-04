import type { ReactNode } from 'react';
import type { Bi } from './types';
import { useLang } from './useLang';

/** Renders `text` with inline `code` spans. */
export function rich(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

/** Bilingual text that follows the language toggle. "Both" shows Hinglish under English. */
export function T({ v, ui }: { v: Bi | string; /** short interface label: English only in "both" mode */ ui?: boolean }) {
  const lang = useLang();
  if (typeof v === 'string' || v.en === v.hi) return <>{rich(typeof v === 'string' ? v : v.en)}</>;
  if (lang === 'hi') return <span lang="hi-Latn">{rich(v.hi)}</span>;
  if (lang === 'both' && ui) return <>{rich(v.en)}</>;
  if (lang === 'both')
    return (
      <>
        <span>{rich(v.en)}</span>
        <span className="t-hi" lang="hi-Latn">{rich(v.hi)}</span>
      </>
    );
  return <>{rich(v.en)}</>;
}

/** Picks a plain string for attributes like aria-label/title. */
export function useText() {
  const lang = useLang();
  return (v: Bi | string) => (typeof v === 'string' ? v : lang === 'hi' ? v.hi : v.en);
}
