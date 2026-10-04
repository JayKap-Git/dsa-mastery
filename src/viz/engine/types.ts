/** A string in both languages. Hinglish is Roman-script, friendly-teacher tone. */
export interface Bi {
  en: string;
  hi: string;
}

export type Lang = 'en' | 'hi' | 'both';

/**
 * Visual roles. Every view maps these to the same colour tokens, and every
 * visualiser shows a legend, so colour is never the only signal.
 */
export type Role =
  | 'active' // the element being worked on right now
  | 'compare' // a second element involved in the current step
  | 'range' // inside the queried / considered range
  | 'done' // contributes to (or is) the answer
  | 'path' // on the path being walked
  | 'changed' // value was just written
  | 'plus' // added (inclusion–exclusion)
  | 'minus' // subtracted (inclusion–exclusion)
  | 'muted'; // out of play

/** One snapshot of an algorithm run. Tracers produce Frame[]; views render `state`. */
export interface Frame<S> {
  state: S;
  /** `// @step` labels in the Java snippet to highlight. */
  step?: string | string[];
  say: Bi;
  /** Live variables for the watch panel. */
  vars?: Record<string, string | number | boolean>;
}

export interface LegendItem {
  role: Role;
  label: Bi;
}

export const bi = (en: string, hi: string): Bi => ({ en, hi });
