import type { Frame, Role } from '../../engine/types';
import type { Pointer, RangeMark } from '../../views/ArrayView';

// Mirrors MeetInTheMiddle.java (regions: sums, mitm).

export interface MitmState {
  list: number[];
  listRanges: RangeMark[];
  sa: number[] | null;
  sb: number[] | null;
  saRoles: Partial<Record<number, Role>>;
  sbRoles: Partial<Record<number, Role>>;
  saPtr: Pointer[];
  sbPtr: Pointer[];
}

export function subsetSums(a: number[]): number[] {
  const s: number[] = [];
  for (let b = 0; b < 1 << a.length; b++) s.push(a.reduce((t, v, i) => ((b >> i) & 1 ? t + v : t), 0));
  return s.sort((p, q) => p - q);
}

export function traceMitm(list: number[], x: number): Frame<MitmState>[] {
  const half = Math.floor(list.length / 2);
  const A = list.slice(0, half), B = list.slice(half);
  const sa = subsetSums(A), sb = subsetSums(B);
  const ranges: RangeMark[] = [
    ...(half > 0 ? [{ from: 0, to: half - 1, role: 'range' as Role, label: 'A' }] : []),
    { from: half, to: list.length - 1, role: 'compare', label: 'B' },
  ];
  const base = { list, listRanges: ranges };
  const frames: Frame<MitmState>[] = [
    {
      state: { ...base, sa: null, sb: null, saRoles: {}, sbRoles: {}, saPtr: [], sbPtr: [] },
      say: { en: `Can some numbers add up to ${x}? Trying all 2^${list.length} = ${2 ** list.length} subsets works, but split the list in half instead: A and B.`, hi: `Kya kuch numbers ka sum ${x} ban sakta hai? Saare 2^${list.length} = ${2 ** list.length} subsets try karna chalta hai — par list ko aadha karo: A aur B.` },
    },
    {
      state: { ...base, sa, sb: null, saRoles: {}, sbRoles: {}, saPtr: [], sbPtr: [] },
      step: 'left',
      say: { en: `S_A = every subset sum of A (2^${A.length} = ${sa.length} sums), sorted.`, hi: `S_A = A ke har subset ka sum (2^${A.length} = ${sa.length} sums), sorted.` },
    },
    {
      state: { ...base, sa, sb, saRoles: {}, sbRoles: {}, saPtr: [], sbPtr: [] },
      step: 'right',
      say: { en: `S_B = every subset sum of B (${sb.length} sums). Now find s_a + s_b = ${x} with one sum from each list.`, hi: `S_B = B ke har subset ka sum (${sb.length} sums). Ab dono lists se ek-ek sum lo jinka total ${x} ho.` },
    },
  ];
  let i = 0, j = sb.length - 1;
  while (i < sa.length && j >= 0) {
    const s = sa[i] + sb[j];
    const st = (extraA: Role, extraB: Role): MitmState => ({ ...base, sa, sb, saRoles: { [i]: extraA }, sbRoles: { [j]: extraB }, saPtr: [{ at: i, label: 'i' }], sbPtr: [{ at: j, label: 'j' }] });
    if (s === x) {
      frames.push({ state: st('done', 'done'), step: ['pair', 'found'], say: { en: `${sa[i]} + ${sb[j]} = ${x}. Found: the two halves' subsets combine into the answer.`, hi: `${sa[i]} + ${sb[j]} = ${x}. Mil gaya: dono halves ke subsets milkar answer bana dete hain.` }, vars: { i, j, sum: s, x, answer: 'yes' } });
      return frames;
    }
    if (s < x) {
      frames.push({ state: st('active', 'compare'), step: ['pair', 'up'], say: { en: `${sa[i]} + ${sb[j]} = ${s} < ${x}: too small, take a bigger sum from S_A (i++).`, hi: `${sa[i]} + ${sb[j]} = ${s} < ${x}: chhota hai, S_A se bada sum lo (i++).` }, vars: { i, j, sum: s, x } });
      i++;
    } else {
      frames.push({ state: st('compare', 'active'), step: ['pair', 'down'], say: { en: `${sa[i]} + ${sb[j]} = ${s} > ${x}: too big, take a smaller sum from S_B (j--).`, hi: `${sa[i]} + ${sb[j]} = ${s} > ${x}: bada hai, S_B se chhota sum lo (j--).` }, vars: { i, j, sum: s, x } });
      j--;
    }
  }
  frames.push({
    state: { ...base, sa, sb, saRoles: {}, sbRoles: {}, saPtr: [], sbPtr: [] },
    step: 'none',
    say: { en: `The pointers crossed: no pair adds up to ${x}, so no subset of the list does either. Work: O(2^(n/2)) sums instead of 2ⁿ.`, hi: `Pointers cross ho gaye: koi pair ${x} nahi banata, toh list ka koi subset bhi nahi. Kaam: 2ⁿ ki jagah O(2^(n/2)) sums.` },
    vars: { answer: 'no' },
  });
  return frames;
}
