import type { Frame, Role } from '../../engine/types';
import type { Pointer, RangeMark } from '../../views/ArrayView';

type Roles = Partial<Record<number, Role>>;

// ───────────── §8.1 subarray sum (TwoPointers.java: subarray) ─────────────

export interface PtrState {
  a: number[];
  roles: Roles;
  pointers: Pointer[];
  ranges: RangeMark[];
  /** Positions of the answer, once found; null when there is none. */
  found?: number[] | null;
}

export function traceSubarraySum(a: number[], x: number): Frame<PtrState>[] {
  const n = a.length;
  let right = 0, sum = 0, moves = 0;
  const snap = (left: number, extra: Roles = {}, done = false): PtrState => {
    const roles: Roles = {};
    for (let i = 0; i < left; i++) roles[i] = 'muted';
    for (let i = left; i < right; i++) roles[i] = done ? 'done' : 'range';
    Object.assign(roles, extra);
    const pointers: Pointer[] = [{ at: Math.min(left, n - 1), label: 'L', role: 'active' }];
    if (right > left) pointers.push({ at: right - 1, label: 'R', role: 'compare' });
    const ranges: RangeMark[] = right > left ? [{ from: left, to: right - 1, role: done ? 'done' : 'range', label: `Σ ${sum}` }] : [];
    return { a, roles, pointers, ranges };
  };
  const vars = (left: number) => ({ L: left, R: right > left ? right - 1 : '–', sum, x, 'R moves': moves });
  const frames: Frame<PtrState>[] = [{
    state: snap(0),
    say: { en: `Find a subarray with sum ${x}. The window runs from L to R. Each turn, R moves right while the sum stays ≤ ${x}, then L moves one step.`, hi: `Sum ${x} wala subarray dhundho. Window L se R tak hai. Har turn mein R tab tak right jaata hai jab tak sum ≤ ${x} rahe, phir L ek step aage.` },
    vars: vars(0),
  }];
  for (let left = 0; left < n; left++) {
    while (right < n && sum + a[right] <= x) {
      sum += a[right++];
      moves++;
      frames.push({
        state: snap(left, { [right - 1]: 'changed' }),
        step: 'grow',
        say: { en: `R takes ${a[right - 1]}: the sum is ${sum} ≤ ${x}.`, hi: `R ne ${a[right - 1]} liya: sum ${sum} ≤ ${x}.` },
        vars: vars(left),
      });
    }
    const why = right < n
      ? { en: `taking ${a[right]} would make ${sum + a[right]} > ${x}`, hi: `${a[right]} lene se ${sum + a[right]} > ${x} ho jaata` }
      : { en: 'R is at the end', hi: 'R end pe hai' };
    if (sum === x) {
      frames.push({
        state: { ...snap(left, {}, true), found: [left, right - 1] },
        step: 'found',
        say: { en: `Sum ${x} found: ${a.slice(left, right).join(' + ')} (positions ${left}..${right - 1}). R moved ${moves} times in total, never more than n = ${n}.`, hi: `Sum ${x} mil gaya: ${a.slice(left, right).join(' + ')} (positions ${left}..${right - 1}). R kul ${moves} baar chala — n = ${n} se zyada kabhi nahi.` },
        vars: vars(left),
      });
      return frames;
    }
    if (right === left) {
      right++;
      frames.push({
        state: snap(left, { [left]: 'muted' }),
        step: 'skip',
        say: { en: `${a[left]} alone is already more than ${x}, so the window is empty. Step past it.`, hi: `${a[left]} akela hi ${x} se bada hai, toh window khaali. Ise chhod ke aage badho.` },
        vars: vars(left),
      });
    } else {
      frames.push({
        state: snap(left, { [left]: 'minus' }),
        step: 'shrink',
        say: { en: `The sum ${sum} isn't ${x}, and ${why.en}. So L moves on and ${a[left]} leaves the window.`, hi: `Sum ${sum} ≠ ${x}, aur ${why.hi}. Toh L aage badhta hai aur ${a[left]} window se bahar.` },
        vars: vars(left),
      });
      sum -= a[left];
    }
  }
  frames.push({
    state: { ...snap(n), found: null },
    say: { en: `No subarray sums to ${x}. L and R each moved at most n = ${n} times, so the whole search is O(n).`, hi: `Koi subarray ${x} nahi banata. L aur R dono max n = ${n} baar chale — poori search O(n).` },
    vars: { ...vars(n), L: '–' },
  });
  return frames;
}

// ───────────── §8.1 2SUM (TwoPointers.java: twoSum) ─────────────

export function traceTwoSum(sorted: number[], x: number): Frame<PtrState>[] {
  const a = sorted;
  const n = a.length;
  let right = n - 1, moves = 0;
  const snap = (left: number, extra: Roles = {}): PtrState => {
    const roles: Roles = {};
    for (let i = 0; i < n; i++) if (i < left || i > right) roles[i] = 'muted';
    Object.assign(roles, extra);
    return { a, roles, pointers: [{ at: left, label: 'L', role: 'active' }, { at: Math.max(right, 0), label: 'R', role: 'compare' }], ranges: [] };
  };
  const vars = (left: number) => ({ L: left, R: right, 'a[L] + a[R]': n ? a[left] + a[right] : '–', x, 'pointer moves': moves });
  const frames: Frame<PtrState>[] = [{
    state: snap(0),
    say: { en: `The array is sorted. L starts at the smallest value and R at the largest. Each turn, R moves left while a[L] + a[R] > ${x}; then L moves right.`, hi: `Array sorted hai. L sabse chhote pe, R sabse bade pe. Har turn mein R tab tak left jaata hai jab tak a[L] + a[R] > ${x}; phir L right jaata hai.` },
    vars: vars(0),
  }];
  for (let left = 0; left < right; left++) {
    while (left < right && a[left] + a[right] > x) {
      frames.push({
        state: snap(left, { [right]: 'minus' }),
        step: 'down',
        say: { en: `${a[left]} + ${a[right]} = ${a[left] + a[right]} > ${x}. Any L further right only makes it bigger, so ${a[right]} can't be in the pair: R moves left.`, hi: `${a[left]} + ${a[right]} = ${a[left] + a[right]} > ${x}. L aage badhega toh sum aur badhega — toh ${a[right]} pair mein nahi ho sakta: R left jaata hai.` },
        vars: vars(left),
      });
      right--;
      moves++;
    }
    if (left === right) break;
    const s = a[left] + a[right];
    if (s === x) {
      frames.push({
        state: { ...snap(left, { [left]: 'done', [right]: 'done' }), found: [left, right] },
        step: ['check', 'found'],
        say: { en: `${a[left]} + ${a[right]} = ${x}. Found the pair at positions ${left} and ${right}, after ${moves} pointer moves (at most n).`, hi: `${a[left]} + ${a[right]} = ${x}. Pair mil gaya, positions ${left} aur ${right} — ${moves} pointer moves mein (max n).` },
        vars: vars(left),
      });
      return frames;
    }
    frames.push({
      state: snap(left, { [left]: 'compare' }),
      step: 'check',
      say: { en: `${a[left]} + ${a[right]} = ${s} < ${x}. Even the largest partner left is too small for ${a[left]}, so L moves right.`, hi: `${a[left]} + ${a[right]} = ${s} < ${x}. ${a[left]} ke liye bacha sabse bada partner bhi chhota hai — L right jaata hai.` },
      vars: vars(left),
    });
    moves++;
  }
  frames.push({
    state: { ...snap(Math.min(n - 1, Math.max(right, 0))), found: null },
    say: { en: `The pointers met: no two values add up to ${x}. O(n) after the O(n log n) sort.`, hi: `Pointers mil gaye: koi do values ${x} nahi banati. Sort O(n log n), uske baad O(n).` },
    vars: { x, 'pointer moves': moves },
  });
  return frames;
}

// ───────────── §8.2 nearest smaller elements (NearestSmaller.java: stack) ─────────────

export interface StackState {
  a: number[];
  roles: Roles;
  /** Positions on the stack, bottom → top. */
  stack: number[];
  stackRoles: Roles;
  answer: (number | string | null)[];
  answerRoles: Roles;
  /** Stack operations done at each position so far. */
  work: number[];
}

export function traceNearestSmaller(a: number[]): Frame<StackState>[] {
  const n = a.length;
  const stack: number[] = [];
  const answer: (number | string | null)[] = Array(n).fill(null);
  const work: number[] = Array(n).fill(0);
  let pushes = 0, pops = 0;
  const snap = (i: number, roles: Roles, stackRoles: Roles = {}, answerRoles: Roles = {}): StackState =>
    ({ a, roles, stack: stack.slice(), stackRoles, answer: answer.slice(), answerRoles, work: work.slice() });
  const vars = (i: number) => ({ i, pushes, pops, 'total ops': pushes + pops });
  const frames: Frame<StackState>[] = [{
    state: snap(0, {}),
    say: { en: `For each element, find the nearest smaller element to its left. The stack holds positions whose values increase from bottom to top.`, hi: `Har element ke liye uske left mein sabse paas wala chhota element dhundho. Stack mein positions hain jinki values neeche se upar badhti hain.` },
    vars: vars(0),
  }];
  for (let i = 0; i < n; i++) {
    const inStack = () => Object.fromEntries(stack.map((p) => [p, 'range' as Role])) as Roles;
    while (stack.length && a[stack[stack.length - 1]] >= a[i]) {
      const t = stack[stack.length - 1];
      work[i]++;
      frames.push({
        state: snap(i, { ...inStack(), [t]: 'minus', [i]: 'active' }, { [stack.length - 1]: 'minus' }),
        step: 'pop',
        say: { en: `${a[t]} ≥ ${a[i]}. From now on ${a[i]} is closer and no bigger, so ${a[t]} can never be anyone's answer again: pop it.`, hi: `${a[t]} ≥ ${a[i]}. Ab se ${a[i]} zyada paas hai aur bada nahi — toh ${a[t]} kabhi kisi ka answer nahi banega: pop karo.` },
        vars: vars(i),
      });
      stack.pop();
      pops++;
    }
    const top = stack.length ? stack[stack.length - 1] : -1;
    answer[i] = top < 0 ? '–' : a[top];
    stack.push(i);
    pushes++;
    work[i]++;
    frames.push({
      state: snap(i, { ...inStack(), ...(top >= 0 ? { [top]: 'done' } : {}), [i]: 'active' }, { [stack.length - 1]: 'changed', ...(top >= 0 ? { [stack.length - 2]: 'done' } : {}) }, { [i]: 'changed' }),
      step: ['answer', 'push'],
      say: top < 0
        ? { en: `The stack is empty: nothing before ${a[i]} is smaller. Push ${a[i]}.`, hi: `Stack khaali: ${a[i]} se pehle kuch chhota nahi. ${a[i]} push karo.` }
        : { en: `The top ${a[top]} (position ${top}) is smaller than ${a[i]}, so it's the answer. Push ${a[i]}.`, hi: `Top ${a[top]} (position ${top}) ${a[i]} se chhota hai — yahi answer. ${a[i]} push karo.` },
      vars: vars(i),
    });
  }
  const worst = Math.max(0, ...work);
  frames.push({
    state: snap(n, {}, {}, Object.fromEntries(answer.map((_, i) => [i, 'done' as Role]))),
    say: { en: `Done. One position needed ${worst} operations, but the total is ${pushes} pushes + ${pops} pops ≤ 2n = ${2 * n}: each position is pushed once and popped at most once. That's O(n) amortized.`, hi: `Ho gaya. Ek position pe ${worst} operations lage, par total ${pushes} push + ${pops} pop ≤ 2n = ${2 * n} — har position ek baar push, max ek baar pop. Yahi O(n) amortized hai.` },
    vars: { pushes, pops, 'total ops': pushes + pops, '2n': 2 * n },
  });
  return frames;
}

// ───────────── §8.3 sliding window minimum (SlidingWindowMin.java: deque) ─────────────

export interface WindowState {
  a: number[];
  roles: Roles;
  ranges: RangeMark[];
  /** Positions in the deque, front → back. */
  dq: number[];
  dqRoles: Roles;
  mins: (number | null)[];
  minRoles: Roles;
  work: number[];
}

export function traceWindowMin(a: number[], k: number): Frame<WindowState>[] {
  const n = a.length;
  const dq: number[] = [];
  const mins: (number | null)[] = Array(Math.max(0, n - k + 1)).fill(null);
  const work: number[] = Array(n).fill(0);
  let pushes = 0, pops = 0;
  const snap = (i: number, roles: Roles, dqRoles: Roles = {}, minRoles: Roles = {}): WindowState => {
    const from = Math.max(0, i - k + 1);
    const full = i >= k - 1;
    return {
      a, roles,
      ranges: i < n ? [{ from, to: i, role: 'range', label: full ? `window ${from}..${i}` : 'filling' }] : [],
      dq: dq.slice(), dqRoles, mins: mins.slice(), minRoles, work: work.slice(),
    };
  };
  const inDq = (): Roles => Object.fromEntries(dq.map((p) => [p, 'compare' as Role]));
  const vars = (i: number) => ({ i, k, pushes, pops, 'total ops': pushes + pops });
  const frames: Frame<WindowState>[] = [{
    state: { ...snap(0, {}), ranges: [] },
    say: { en: `Window size k = ${k}. The deque holds positions whose values increase from front to back, so its front is always the window minimum.`, hi: `Window size k = ${k}. Deque mein positions hain jinki values front se back tak badhti hain — toh front hamesha window ka minimum hai.` },
    vars: vars(0),
  }];
  for (let i = 0; i < n; i++) {
    while (dq.length && a[dq[dq.length - 1]] >= a[i]) {
      const b = dq[dq.length - 1];
      work[i]++;
      frames.push({
        state: snap(i, { ...inDq(), [b]: 'minus', [i]: 'active' }, { [dq.length - 1]: 'minus' }),
        step: 'popBack',
        say: { en: `${a[b]} ≥ ${a[i]}, and ${a[i]} will stay in the window longer. ${a[b]} can never be a minimum again: pop it from the back.`, hi: `${a[b]} ≥ ${a[i]}, aur ${a[i]} window mein zyada der rahega. ${a[b]} ab kabhi minimum nahi banega: back se pop karo.` },
        vars: vars(i),
      });
      dq.pop();
      pops++;
    }
    if (dq.length && dq[0] <= i - k) {
      const f = dq[0];
      work[i]++;
      frames.push({
        state: snap(i, { ...inDq(), [f]: 'minus', [i]: 'active' }, { 0: 'minus' }),
        step: 'popFront',
        say: { en: `Position ${f} (value ${a[f]}) has slid out of the window ${i - k + 1}..${i}: pop it from the front.`, hi: `Position ${f} (value ${a[f]}) window ${i - k + 1}..${i} se bahar nikal gaya: front se pop karo.` },
        vars: vars(i),
      });
      dq.shift();
      pops++;
    }
    dq.push(i);
    pushes++;
    work[i]++;
    const report = i >= k - 1;
    if (report) mins[i - k + 1] = a[dq[0]];
    frames.push({
      state: snap(i, { ...inDq(), [dq[0]]: report ? 'done' : 'compare', [i]: 'active' }, { [dq.length - 1]: 'changed', ...(report ? { 0: 'done' } : {}) }, report ? { [i - k + 1]: 'changed' } : {}),
      step: report ? ['push', 'report'] : 'push',
      say: report
        ? { en: `Push ${a[i]} at the back. The front ${a[dq[0]]} is the minimum of window ${i - k + 1}..${i}.`, hi: `${a[i]} ko back pe push karo. Front ${a[dq[0]]} window ${i - k + 1}..${i} ka minimum hai.` }
        : { en: `Push ${a[i]} at the back. The first window isn't full yet.`, hi: `${a[i]} ko back pe push karo. Pehli window abhi poori nahi hui.` },
      vars: vars(i),
    });
  }
  frames.push({
    state: { ...snap(n, {}, {}, Object.fromEntries(mins.map((_, j) => [j, 'done' as Role]))), ranges: [] },
    say: { en: `Minimums: ${mins.join(', ')}. ${pushes} pushes + ${pops} pops ≤ 2n = ${2 * n}: every position enters once and leaves at most once. O(n), whatever k is.`, hi: `Minimums: ${mins.join(', ')}. ${pushes} push + ${pops} pop ≤ 2n = ${2 * n} — har position ek baar aati hai, max ek baar jaati hai. O(n), k kuch bhi ho.` },
    vars: { pushes, pops, 'total ops': pushes + pops, '2n': 2 * n },
  });
  return frames;
}
