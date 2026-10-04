import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';
import { parseJava } from '../../lib/java-source.mjs';
import type { Frame } from '../engine/types';

const javaRoot = fileURLToPath(new URL('../../../java/src/', import.meta.url));

/** Step labels declared with `// @step` in a region of a Java file. */
export function javaSteps(file: string, region: string): Set<string> {
  return new Set(Object.keys(parseJava(readFileSync(javaRoot + file, 'utf8'), region).steps));
}

/** Every frame narrates in both languages and only references step labels that exist in the Java. */
export function expectValidFrames<S>(frames: Frame<S>[], file: string, region: string) {
  const labels = javaSteps(file, region);
  expect(frames.length).toBeGreaterThan(1);
  for (const f of frames) {
    expect(f.say.en.trim(), 'English narration').not.toBe('');
    expect(f.say.hi.trim(), 'Hinglish narration').not.toBe('');
    const steps = f.step === undefined ? [] : Array.isArray(f.step) ? f.step : [f.step];
    for (const s of steps) expect(labels.has(s), `@step ${s} exists in ${file}#${region}`).toBe(true);
  }
}

export const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const randArr = (n: number, lo = -50, hi = 50) => Array.from({ length: n }, () => rand(lo, hi));
export const last = <T>(xs: T[]) => xs[xs.length - 1];
