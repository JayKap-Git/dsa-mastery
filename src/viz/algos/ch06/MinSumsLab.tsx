import { useState } from 'react';
import { ArrayInput, VizShell } from '../../engine/controls';
import { T } from '../../engine/T';

const BOOK = [1, 2, 9, 2, 6];

/** Drag x along the number line and watch Σ|a − x| and Σ(a − x)² — their minima sit at the median and the mean. */
export default function MinSumsLab() {
  const [a, setA] = useState(BOOK);
  const lo = Math.min(...a) - 2, hi = Math.max(...a) + 2;
  const [x, setX] = useState(3);
  const xs = Math.min(hi, Math.max(lo, x));
  const sorted = a.slice().sort((p, q) => p - q);
  const median = sorted[Math.floor((a.length - 1) / 2)];
  const mean = a.reduce((s, v) => s + v, 0) / a.length;
  const f1 = (t: number) => a.reduce((s, v) => s + Math.abs(v - t), 0);
  const f2 = (t: number) => a.reduce((s, v) => s + (v - t) ** 2, 0);

  const W = 520, H = 120, pad = 24;
  const px = (t: number) => pad + ((t - lo) / (hi - lo)) * (W - 2 * pad);
  const plot = (f: (t: number) => number) => {
    const pts = Array.from({ length: 121 }, (_, i) => lo + ((hi - lo) * i) / 120);
    const ys = pts.map(f), maxY = Math.max(...ys), minY = Math.min(...ys);
    const py = (v: number) => H - 14 - ((v - minY) / (maxY - minY || 1)) * (H - 30);
    return { d: pts.map((t, i) => `${i ? 'L' : 'M'}${px(t).toFixed(1)},${py(ys[i]).toFixed(1)}`).join(' '), py };
  };
  const c1 = plot(f1), c2 = plot(f2);
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

  return (
    <VizShell
      title={{ en: 'Minimising sums: median vs mean', hi: 'Sums minimise karna: median vs mean' }}
      controls={<>
        <ArrayInput label={{ en: 'Numbers', hi: 'Numbers' }} value={a} onChange={(v) => setA(v)} min={-20} max={40} maxLen={9} />
        <div className="field grow">
          <label htmlFor="ms-x"><T v={{ en: `x = ${fmt(xs)}`, hi: `x = ${fmt(xs)}` }} ui /></label>
          <input id="ms-x" type="range" min={lo} max={hi} step={0.25} value={xs} onChange={(e) => setX(Number(e.target.value))} className="cx-slider" />
        </div>
      </>}
    >
      <div className="stage ms-lab">
        {[{ name: 'Σ |aᵢ − x|', c: c1, f: f1, best: median, bestName: { en: `median ${median}`, hi: `median ${median}` } },
          { name: 'Σ (aᵢ − x)²', c: c2, f: f2, best: mean, bestName: { en: `mean ${fmt(mean)}`, hi: `mean ${fmt(mean)}` } }].map((p) => (
          <div key={p.name} className="ms-plot">
            <div className="ms-head"><code>{p.name}</code> = <b>{fmt(p.f(xs))}</b> <span className="muted"><T v={{ en: `· minimum at the ${p.bestName.en}`, hi: `· minimum ${p.bestName.hi} pe` }} /></span></div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={p.name}>
              <path d={p.c.d} className="ms-curve" />
              <line x1={px(p.best)} x2={px(p.best)} y1={6} y2={H - 14} className="ms-best" />
              <circle cx={px(xs)} cy={p.c.py(p.f(xs))} r={6} className="ms-dot" />
              {a.map((v, i) => <circle key={i} cx={px(v)} cy={H - 6} r={4} className="ms-point" />)}
            </svg>
          </div>
        ))}
        <p className="muted"><T v={{ en: 'With an even count, every x between the two middle numbers is optimal for Σ|a − x|.', hi: 'Ginti even ho toh beech ke do numbers ke darmiyan har x Σ|a − x| ke liye optimal hai.' }} /></p>
      </div>
    </VizShell>
  );
}
