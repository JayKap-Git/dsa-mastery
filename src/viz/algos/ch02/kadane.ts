import type { Frame, Role } from '../../engine/types';
import type { RangeMark } from '../../views/ArrayView';

// Mirrors MaxSubarray.java (region: kadane).

export interface KadaneState {
  a: number[];
  roles: Partial<Record<number, Role>>;
  ranges: RangeMark[];
}

export const maxSubarrayBrute = (a: number[]) => {
  let best = 0;
  for (let x = 0; x < a.length; x++) {
    let s = 0;
    for (let y = x; y < a.length; y++) {
      s += a[y];
      best = Math.max(best, s);
    }
  }
  return best;
};

export function traceKadane(a: number[]): Frame<KadaneState>[] {
  const frames: Frame<KadaneState>[] = [];
  let best = 0, sum = 0;
  let start = 0; // where the current "best subarray ending here" starts
  let bestRange: [number, number] | null = null;
  const ranges = (k: number): RangeMark[] => [
    ...(sum > 0 && k >= start ? [{ from: start, to: k, role: 'range' as Role, label: `sum ${sum}` }] : []),
    ...(bestRange ? [{ from: bestRange[0], to: bestRange[1], role: 'done' as Role, label: `best ${best}` }] : []),
  ];

  frames.push({
    state: { a, roles: {}, ranges: [] },
    say: {
      en: 'Idea: for each position k, track sum = the best sum of a subarray that ENDS at k. The answer is the largest such sum (or 0 for the empty subarray).',
      hi: 'Idea: har position k ke liye sum = k pe KHATAM hone wale subarray ka best sum. Answer in sab mein sabse bada (ya empty subarray ka 0).',
    },
    vars: { best, sum },
  });

  for (let k = 0; k < a.length; k++) {
    const extended = sum + a[k];
    const restart = a[k] > extended;
    sum = Math.max(a[k], extended);
    if (restart) start = k;
    frames.push({
      state: { a, roles: { [k]: 'active' }, ranges: ranges(k) },
      step: 'extend',
      say: restart
        ? {
            en: `k = ${k}: a[k] = ${a[k]} alone beats extending (${extended}), because the previous sum was negative. Start fresh here: sum = ${sum}.`,
            hi: `k = ${k}: akela a[k] = ${a[k]}, extend karne (${extended}) se behtar hai — pichhla sum negative tha. Yahin se naya shuru: sum = ${sum}.`,
          }
        : {
            en: `k = ${k}: extend the previous subarray: sum = ${extended - a[k]} + ${a[k]} = ${sum}.`,
            hi: `k = ${k}: pichhle subarray ko aage badhao: sum = ${extended - a[k]} + ${a[k]} = ${sum}.`,
          },
      vars: { k, 'a[k]': a[k], sum, best },
    });
    if (sum > best) {
      best = sum;
      bestRange = [start, k];
      frames.push({
        state: { a, roles: { [k]: 'active' }, ranges: ranges(k) },
        step: 'best',
        say: { en: `New best: ${best} (positions ${start}..${k}).`, hi: `Naya best: ${best} (positions ${start}..${k}).` },
        vars: { k, sum, best },
      });
    }
  }
  frames.push({
    state: { a, roles: Object.fromEntries(bestRange ? Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, i) => [bestRange![0] + i, 'done' as Role]) : []), ranges: bestRange ? [{ from: bestRange[0], to: bestRange[1], role: 'done', label: `best ${best}` }] : [] },
    step: 'done',
    say: {
      en: `Done in one pass: the maximum subarray sum is ${best}. Each element was looked at once, so this is O(n).`,
      hi: `Ek hi pass mein ho gaya: maximum subarray sum = ${best}. Har element ek baar dekha, isliye O(n).`,
    },
    vars: { best },
  });
  return frames;
}
