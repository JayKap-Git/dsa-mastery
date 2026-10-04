import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { JavaSnippet } from '../../lib/java-source.mjs';
import type { Frame, LegendItem } from './types';
import { T, useText } from './T';
import { Legend } from './Legend';

const SPEEDS = [0.5, 1, 2, 4] as const;
const BASE_DELAY = 1100;

interface PlayerProps<S> {
  frames: Frame<S>[];
  render: (frame: Frame<S>, index: number) => ReactNode;
  code?: JavaSnippet;
  legend?: LegendItem[];
  /** Change this whenever the input changes, so playback restarts from the first frame. */
  resetKey?: unknown;
  /** Start on the last frame instead of the first (handy for "result" views). */
  startAtEnd?: boolean;
}

export function Player<S>({ frames, render, code, legend, resetKey, startAtEnd }: PlayerProps<S>) {
  const last = Math.max(0, frames.length - 1);
  const [i, setI] = useState(startAtEnd ? last : 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [showCode, setShowCode] = useState(true);
  const text = useText();

  useEffect(() => {
    setI(startAtEnd ? last : 0);
    setPlaying(false);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const idx = Math.min(i, last);
  const frame = frames[idx];

  useEffect(() => {
    if (!playing) return;
    if (idx >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((v) => Math.min(v + 1, last)), BASE_DELAY / speed);
    return () => clearTimeout(t);
  }, [playing, idx, last, speed]);

  const go = useCallback((n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(n, last)));
  }, [last]);

  // Relative moves use the functional form so fast clicks / key repeat never skip or stall.
  const step = useCallback((d: number) => {
    setPlaying(false);
    setI((v) => Math.max(0, Math.min(Math.min(v, last) + d, last)));
  }, [last]);

  const toggle = () => {
    if (idx >= last) setI(0);
    setPlaying((p) => !p);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowRight' || e.key === 'l') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'j') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(last); }
  };

  const activeLines = useMemo(() => {
    const labels = frame?.step ? (Array.isArray(frame.step) ? frame.step : [frame.step]) : [];
    return new Set(labels.flatMap((l) => code?.steps[l] ?? []));
  }, [frame, code]);

  if (!frame) return null;
  const vars = frame.vars ? Object.entries(frame.vars) : [];

  return (
    <div className="player" tabIndex={0} onKeyDown={onKey} aria-label={text({ en: 'Visualiser. Space to play, arrow keys to step.', hi: 'Visualiser. Space se play, arrow keys se step.' })}>
      {legend && <Legend items={legend} />}
      <div className="stage">{render(frame, idx)}</div>

      <div className="narration" aria-live="polite">
        <span className="step-no">{idx + 1}/{frames.length}</span>
        <p><T v={frame.say} /></p>
      </div>

      <div className="transport">
        <button type="button" onClick={() => go(0)} disabled={idx === 0} aria-label={text({ en: 'First step', hi: 'Pehla step' })} title="Home">⏮</button>
        <button type="button" onClick={() => step(-1)} disabled={idx === 0} aria-label={text({ en: 'Previous step', hi: 'Pichhla step' })} title="←">◀</button>
        <button type="button" className="play" onClick={toggle} aria-label={playing ? text({ en: 'Pause', hi: 'Pause' }) : text({ en: 'Play', hi: 'Play' })} title="Space">
          {playing ? '❚❚' : '▶'}
        </button>
        <button type="button" onClick={() => step(1)} disabled={idx === last} aria-label={text({ en: 'Next step', hi: 'Agla step' })} title="→">▶</button>
        <button type="button" onClick={() => go(last)} disabled={idx === last} aria-label={text({ en: 'Last step', hi: 'Aakhri step' })} title="End">⏭</button>
        <input
          type="range" min={0} max={last} value={idx}
          onChange={(e) => go(Number(e.target.value))}
          aria-label={text({ en: 'Scrub through steps', hi: 'Steps ke beech jao' })}
        />
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEEDS)[number])} aria-label={text({ en: 'Speed', hi: 'Speed' })}>
          {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
        </select>
        {code && (
          <button type="button" className="code-toggle" onClick={() => setShowCode((v) => !v)} aria-pressed={showCode}>
            {showCode ? text({ en: 'Hide code', hi: 'Code chhupao' }) : text({ en: 'Show Java', hi: 'Java dikhao' })}
          </button>
        )}
      </div>

      {(code && showCode) || vars.length ? (
        <div className={`code-row${code && showCode ? '' : ' vars-only'}`}>
          {code && showCode && <CodePanel code={code} active={activeLines} />}
          {vars.length > 0 && (
            <dl className="watch">
              {vars.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
              ))}
            </dl>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CodePanel({ code, active }: { code: JavaSnippet; active: Set<number> }) {
  const box = useRef<HTMLPreElement>(null);

  // Keep the first active line in view by scrolling the panel itself — never the page.
  useEffect(() => {
    const first = Math.min(...active);
    const el = box.current;
    if (!el || !Number.isFinite(first)) return;
    const line = el.querySelector<HTMLElement>(`[data-line="${first}"]`);
    if (!line) return;
    const top = line.offsetTop - el.offsetTop;
    if (top < el.scrollTop || top + line.offsetHeight > el.scrollTop + el.clientHeight) {
      el.scrollTo({ top: Math.max(0, top - el.clientHeight / 3), behavior: 'smooth' });
    }
  }, [active]);

  return (
    <pre className="code code-panel" ref={box}>
      <code>
        {code.lines.map((html, n) => (
          <span key={n} data-line={n + 1} className={active.has(n + 1) ? 'line hl' : 'line'}>
            <span className="ln" aria-hidden="true">{n + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: html || ' ' }} />
          </span>
        ))}
      </code>
    </pre>
  );
}
