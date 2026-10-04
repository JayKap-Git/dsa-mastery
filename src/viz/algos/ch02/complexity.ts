// Rough operation counts for each complexity class, and whether they fit in a time limit.

export interface ComplexityClass {
  id: string;
  label: string;
  ops: (n: number) => number;
}

const fact = (n: number) => {
  let r = 1;
  for (let i = 2; i <= n && r < 1e300; i++) r *= i;
  return n > 170 ? Infinity : r;
};

export const CLASSES: ComplexityClass[] = [
  { id: '1', label: 'O(1)', ops: () => 1 },
  { id: 'logn', label: 'O(log n)', ops: (n) => Math.max(1, Math.log2(n)) },
  { id: 'sqrt', label: 'O(√n)', ops: (n) => Math.sqrt(n) },
  { id: 'n', label: 'O(n)', ops: (n) => n },
  { id: 'nlogn', label: 'O(n log n)', ops: (n) => n * Math.max(1, Math.log2(n)) },
  { id: 'n2', label: 'O(n²)', ops: (n) => n * n },
  { id: 'n3', label: 'O(n³)', ops: (n) => n ** 3 },
  { id: '2n', label: 'O(2ⁿ)', ops: (n) => (n > 1023 ? Infinity : 2 ** n) },
  { id: 'nfact', label: 'O(n!)', ops: fact },
];

/** A modern judge does a few hundred million simple steps per second; 10^8 is a safe planning number. */
export const OPS_PER_SECOND = 1e8;

export type Verdict = 'fast' | 'tight' | 'slow';

export function verdict(ops: number, limitSeconds = 1): Verdict {
  const t = ops / OPS_PER_SECOND;
  if (t <= limitSeconds * 0.5) return 'fast';
  if (t <= limitSeconds * 3) return 'tight';
  return 'slow';
}

/** 12345678 → "1.2·10⁷" */
export function sci(x: number): string {
  if (!Number.isFinite(x)) return '∞';
  if (x < 1000) return String(Math.round(x));
  const e = Math.floor(Math.log10(x));
  const m = x / 10 ** e;
  const sup = String(e).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
  return `${m.toFixed(1)}·10${sup}`;
}

export function seconds(ops: number): string {
  if (!Number.isFinite(ops)) return 'forever';
  const t = ops / OPS_PER_SECOND;
  if (t < 1e-3) return '< 1 ms';
  if (t < 1) return `${Math.round(t * 1000)} ms`;
  if (t < 120) return `${t.toFixed(1)} s`;
  if (t < 7200) return `${Math.round(t / 60)} min`;
  if (t < 86400 * 365 * 2) return `${Math.round(t / 3600)} h`;
  return 'longer than you live';
}

/** The book's table: input size → the complexity a 1-second solution usually needs. */
export const RULES = [
  { max: 10, need: 'O(n!)' },
  { max: 20, need: 'O(2ⁿ)' },
  { max: 500, need: 'O(n³)' },
  { max: 5000, need: 'O(n²)' },
  { max: 1e6, need: 'O(n log n) or O(n)' },
  { max: Infinity, need: 'O(1) or O(log n)' },
];
export const ruleFor = (n: number) => RULES.findIndex((r) => n <= r.max);
