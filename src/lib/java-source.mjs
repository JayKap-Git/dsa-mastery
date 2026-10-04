// @ts-check
// Build-time helper shared by the Vite plugin (`@java/...?region=x` imports), JavaCode.astro
// and scripts/lint-content.mjs. It turns a region of a real, compilable Java file into
// display-ready code plus a map from `// @step label` markers to line numbers.
import { readFileSync } from 'node:fs';
import { createHighlighter } from 'shiki';

const REGION_START = /^\s*\/\/\s*#region\s+([\w-]+)\s*$/;
const REGION_END = /^\s*\/\/\s*#endregion\b.*$/;
const STEP = /\s*\/\/\s*@step\s+([\w,-]+)\s*$/;

/**
 * @param {string} source full Java file
 * @param {string} [region] name of a `// #region name` block; omitted = whole file minus `package`
 * @returns {{ code: string, steps: Record<string, number[]> }}
 */
export function parseJava(source, region) {
  let lines = source.replace(/\r\n/g, '\n').split('\n');

  if (region) {
    const start = lines.findIndex((l) => REGION_START.exec(l)?.[1] === region);
    if (start < 0) throw new Error(`Java region "${region}" not found`);
    let depth = 0;
    let end = -1;
    for (let i = start + 1; i < lines.length; i++) {
      if (REGION_START.test(lines[i])) depth++;
      else if (REGION_END.test(lines[i])) {
        if (depth === 0) { end = i; break; }
        depth--;
      }
    }
    if (end < 0) throw new Error(`Java region "${region}" has no // #endregion`);
    lines = lines.slice(start + 1, end);
  } else {
    lines = lines.filter((l) => !/^\s*package\s/.test(l));
  }

  lines = lines.filter((l) => !REGION_START.test(l) && !REGION_END.test(l));
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => /** @type {RegExpMatchArray} */ (l.match(/^ */))[0].length),
  );

  /** @type {Record<string, number[]>} */
  const steps = {};
  const out = lines.map((line, i) => {
    const m = STEP.exec(line);
    if (m) {
      for (const label of m[1].split(',')) (steps[label] ??= []).push(i + 1);
      line = line.slice(0, m.index);
    }
    return line.slice(Number.isFinite(indent) ? indent : 0).replace(/\s+$/, '');
  });

  return { code: out.join('\n'), steps };
}

/** @type {Promise<import('shiki').Highlighter> | undefined} */
let highlighter;

/** @param {string} s */
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Highlights Java into one HTML string per line, coloured through the
 * --shiki-light / --shiki-dark CSS variables so the active theme picks the palette.
 * @param {string} code
 * @returns {Promise<string[]>}
 */
export async function highlightJava(code) {
  highlighter ??= createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['java'] });
  const hl = await highlighter;
  const { tokens } = hl.codeToTokens(code, {
    lang: 'java',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
  return tokens.map((line) =>
    line
      .map((t) => {
        const style = Object.entries(t.htmlStyle ?? {})
          .map(([k, v]) => `${k}:${v}`)
          .join(';');
        return style ? `<span style="${style}">${escapeHtml(t.content)}</span>` : escapeHtml(t.content);
      })
      .join(''),
  );
}

/**
 * @param {string} absPath absolute path of the .java file
 * @param {string} [region]
 * @returns {Promise<import('./java-source.mjs').JavaSnippet>}
 */
export async function loadJava(absPath, region) {
  const { code, steps } = parseJava(readFileSync(absPath, 'utf8'), region);
  return { code, steps, lines: await highlightJava(code) };
}
