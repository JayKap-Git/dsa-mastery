import { useEffect, useId, useState, type ReactNode } from 'react';
import type { Bi } from './types';
import { T, useText } from './T';

/** Card around one visualiser: title, input controls, then the player. */
export function VizShell({ title, controls, children }: { title: Bi | string; controls?: ReactNode; children: ReactNode }) {
  return (
    <figure className="viz not-prose" data-pagefind-ignore>
      <figcaption className="viz-head">
        <span className="viz-kicker">Visualiser</span>
        <span className="viz-title"><T v={title} ui /></span>
      </figcaption>
      {controls && <div className="viz-controls">{controls}</div>}
      {children}
    </figure>
  );
}

export const parseInts = (s: string) =>
  s.split(/[\s,]+/).filter(Boolean).map(Number);

interface ArrayInputProps {
  label: Bi;
  value: number[];
  onChange: (v: number[]) => void;
  min?: number;
  max?: number;
  minLen?: number;
  maxLen?: number;
  /** Extra check, e.g. "length must be a power of two". Return an error or null. */
  validate?: (v: number[]) => Bi | null;
}

/** Comma/space-separated integer list. Applies on Enter or blur; shows a bilingual error otherwise. */
export function ArrayInput({ label, value, onChange, min = -99, max = 99, minLen = 1, maxLen = 16, validate }: ArrayInputProps) {
  const id = useId();
  const [draft, setDraft] = useState(value.join(', '));
  const [err, setErr] = useState<Bi | null>(null);

  useEffect(() => setDraft(value.join(', ')), [value]);

  const apply = () => {
    const nums = parseInts(draft);
    let e: Bi | null = null;
    if (nums.some((n) => !Number.isInteger(n))) e = { en: 'Use whole numbers only.', hi: 'Sirf whole numbers daalo.' };
    else if (nums.length < minLen || nums.length > maxLen)
      e = { en: `Enter ${minLen}–${maxLen} numbers.`, hi: `${minLen} se ${maxLen} numbers daalo.` };
    else if (nums.some((n) => n < min || n > max))
      e = { en: `Values must be between ${min} and ${max}.`, hi: `Values ${min} aur ${max} ke beech honi chahiye.` };
    else e = validate?.(nums) ?? null;
    setErr(e);
    if (!e && nums.join() !== value.join()) onChange(nums);
  };

  return (
    <div className="field grow">
      <label htmlFor={id}><T v={label} ui /></label>
      <input
        id={id} type="text" inputMode="numeric" value={draft} spellCheck={false}
        aria-invalid={!!err}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
      />
      {err && <span className="field-err" role="alert"><T v={err} /></span>}
    </div>
  );
}

interface NumberFieldProps {
  label: Bi | string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}

export function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.round(Number(draft));
    const v = Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : value;
    setDraft(String(v));
    if (v !== value) onChange(v);
  };
  return (
    <div className="field num">
      <label htmlFor={id}><T v={label} ui /></label>
      <input
        id={id} type="number" min={min} max={max} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
    </div>
  );
}

interface SegmentedProps<V extends string> {
  label: Bi | string;
  value: V;
  options: { value: V; label: Bi | string }[];
  onChange: (v: V) => void;
}

export function Segmented<V extends string>({ label, value, options, onChange }: SegmentedProps<V>) {
  const text = useText();
  return (
    <div className="field">
      <span className="field-label"><T v={label} ui /></span>
      <div className="segmented" role="radiogroup" aria-label={text(label)}>
        {options.map((o) => (
          <button
            key={o.value} type="button" role="radio" aria-checked={o.value === value}
            className={o.value === value ? 'on' : ''}
            onClick={() => onChange(o.value)}
          >
            <T v={o.label} ui />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActionButton({ onClick, label }: { onClick: () => void; label: Bi | string }) {
  return <button type="button" className="btn-ghost" onClick={onClick}><T v={label} ui /></button>;
}

export const BOOK_EXAMPLE: Bi = { en: 'Book example', hi: 'Book wala example' };
export const RANDOM: Bi = { en: 'Random', hi: 'Random' };

export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const randArray = (len: number, lo: number, hi: number) => Array.from({ length: len }, () => randInt(lo, hi));
