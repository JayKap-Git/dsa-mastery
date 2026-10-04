import { describe, expect, it } from 'vitest';
import { expectValidFrames, last, rand } from '../testing';
import { huffmanCodes, maxEventsBrute, optimalCoins, scoreOf, traceCoins, traceHuffman, traceSchedule, traceTasks, type Event, type HNode, type Task } from './greedy';

describe('6.1 coins', () => {
  it('greedy is optimal for euro coins, not for {1,3,4}', () => {
    const euro = [1, 2, 5, 10, 20, 50, 100, 200];
    const f = traceCoins(euro, 520);
    expect(last(f).state.taken).toEqual([200, 200, 100, 20]);
    expectValidFrames(f, 'ch06/CoinGreedy.java', 'greedy');
    for (let n = 1; n <= 300; n++) expect(last(traceCoins(euro, n)).state.taken.length).toBe(optimalCoins(euro, n)!.length);
    const bad = last(traceCoins([1, 3, 4], 6));
    expect(bad.state.taken).toEqual([4, 1, 1]);
    expect(bad.state.optimal).toEqual([3, 3]);
  });
});

describe('6.2 scheduling', () => {
  const book: Event[] = [{ name: 'A', start: 1, end: 3 }, { name: 'B', start: 2, end: 5 }, { name: 'C', start: 3, end: 9 }, { name: 'D', start: 6, end: 8 }];
  it('earliest end is always optimal', () => {
    expect(last(traceSchedule(book, 'earliestEnd')).vars?.chosen).toBe(2);
    expectValidFrames(traceSchedule(book, 'earliestEnd'), 'ch06/Scheduling.java', 'earliestEnd');
    for (let t = 0; t < 300; t++) {
      const ev: Event[] = Array.from({ length: rand(1, 8) }, (_, i) => { const s = rand(0, 15); return { name: String.fromCharCode(65 + i), start: s, end: s + rand(1, 6) }; });
      expect(last(traceSchedule(ev, 'earliestEnd')).vars?.chosen).toBe(maxEventsBrute(ev));
    }
  });
  it('the other strategies have counterexamples', () => {
    expect(last(traceSchedule([{ name: 'A', start: 1, end: 5 }, { name: 'B', start: 4, end: 7 }, { name: 'C', start: 6, end: 10 }], 'shortest')).vars?.chosen).toBe(1);
    expect(last(traceSchedule([{ name: 'A', start: 1, end: 10 }, { name: 'B', start: 2, end: 4 }, { name: 'C', start: 5, end: 7 }], 'earliestStart')).vars?.chosen).toBe(1);
  });
});

describe('6.3 tasks', () => {
  it('book total -10, and shortest-first beats every order', () => {
    const book: Task[] = [{ name: 'A', duration: 4, deadline: 2 }, { name: 'B', duration: 3, deadline: 5 }, { name: 'C', duration: 2, deadline: 7 }, { name: 'D', duration: 4, deadline: 5 }];
    const f = traceTasks(book);
    expect(last(f).vars?.total).toBe(-10);
    expectValidFrames(f, 'ch06/TasksDeadlines.java', 'score');
    for (let t = 0; t < 200; t++) {
      const ts: Task[] = Array.from({ length: rand(1, 5) }, (_, i) => ({ name: String(i), duration: rand(1, 9), deadline: rand(0, 20) }));
      const best = last(traceTasks(ts)).vars?.total as number;
      const perms = (a: Task[]): Task[][] => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
      expect(best).toBe(Math.max(...perms(ts).map(scoreOf)));
    }
  });
});

describe('6.5 Huffman', () => {
  it('reproduces the book codewords and 15 bits', () => {
    const f = traceHuffman('AABACDACA');
    expect(last(f).vars?.bits).toBe(15);
    expect(Object.fromEntries(last(f).state.codes!)).toEqual({ A: '0', C: '10', B: '110', D: '111' });
    expectValidFrames(f, 'ch06/Huffman.java', 'build');
    const leaf = (ch: string, weight: number, id: number): HNode => ({ id, weight, ch });
    expect(huffmanCodes({ id: 9, weight: 2, left: leaf('x', 1, 0), right: leaf('y', 1, 1) })).toEqual(new Map([['x', '0'], ['y', '1']]));
  });
});
