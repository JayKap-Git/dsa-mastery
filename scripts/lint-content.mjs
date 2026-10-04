// Content linter — run with `npm run lint:content` (part of `npm run verify`).
// Enforces the authoring rules in CLAUDE.md that the type checker can't see.
// Node ≥ 23 strips TypeScript types natively, so the .ts data files import directly.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseJava } from '../src/lib/java-source.mjs';
import { CHAPTERS } from '../src/data/catalog.ts';
import { VISUALIZERS } from '../src/data/visualizers.ts';

const root = resolve(import.meta.dirname, '..');
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

const cses = JSON.parse(readFileSync(join(root, 'src/data/cses.json'), 'utf8'));
const csesById = new Map(Object.values(cses).flat().map(([id, name]) => [id, name]));

function checkRegion(where, file, region) {
  const path = join(root, 'java/src', file);
  if (!existsSync(path)) return fail(where, `Java file ${file} does not exist`);
  try {
    parseJava(readFileSync(path, 'utf8'), region);
  } catch (e) {
    fail(where, `${file}: ${e.message}`);
  }
}

const chapterDir = join(root, 'src/content/chapters');
for (const name of readdirSync(chapterDir).filter((f) => f.endsWith('.mdx'))) {
  const where = `chapters/${name}`;
  const src = readFileSync(join(chapterDir, name), 'utf8');
  const num = Number(src.match(/^num:\s*(\d+)/m)?.[1]);
  const meta = CHAPTERS.find((c) => c.num === num);
  if (!meta) { fail(where, `frontmatter num ${num} is not in the catalog`); continue; }
  if (!name.startsWith(`${String(num).padStart(2, '0')}-${meta.slug}`)) fail(where, `file should be named ${String(num).padStart(2, '0')}-${meta.slug}.mdx`);

  // 1. <En> and <Hi> come in pairs, in that order, and Hinglish isn't a copy of English.
  const blocks = [...src.matchAll(/<(En|Hi)>([\s\S]*?)<\/\1>/g)];
  for (let i = 0; i < blocks.length; i += 2) {
    const [en, hi] = [blocks[i], blocks[i + 1]];
    const line = src.slice(0, en.index).split('\n').length;
    if (en[1] !== 'En' || hi?.[1] !== 'Hi') { fail(`${where}:${line}`, 'expected an <En> block immediately followed by a <Hi> block'); break; }
    if (!hi[2].trim()) fail(`${where}:${line}`, 'empty <Hi> block');
    if (hi[2].trim() === en[2].trim()) fail(`${where}:${line}`, '<Hi> block is identical to <En>');
  }

  // 1b. A bare { or } in prose is parsed as a JavaScript expression by MDX: escape it as \{ \} or use code.
  {
    const body = src.split('\n');
    let inFront = false, inMath = false, inTag = false;
    body.forEach((raw, i) => {
      if (i === 0 && raw === '---') { inFront = true; return; }
      if (inFront) { if (raw === '---') inFront = false; return; }
      if (raw.trim() === '$$') { inMath = !inMath; return; }
      // A component tag spread over several lines (props like rows={[...]}) is JSX, not prose.
      if (inTag) { if (/>\s*$/.test(raw)) inTag = false; return; }
      if (/^\s*<[A-Z]\w*\b/.test(raw) && !/>\s*$/.test(raw)) { inTag = true; return; }
      if (inMath || /^\s*(import |<|\$\$)/.test(raw)) return;
      const prose = raw.replace(/`[^`]*`/g, '').replace(/\$[^$]*\$/g, '').replace(/\\[{}]/g, '');
      if (/[{}]/.test(prose)) fail(`${where}:${i + 1}`, 'unescaped { or } in prose (write \\{ \\} or put it in `code`)');
      // MDX reads < followed by anything but a space as a JSX tag: `i < j` is fine, but << or <= must be in `code`.
      if (/<(?![A-Za-z/\s])/.test(prose)) fail(`${where}:${i + 1}`, 'bare << or <= in prose: put the expression in `code`');
    });
  }

  // 2. Sections match the book's numbering exactly.
  const ids = [...src.matchAll(/<Section id="([\d.]+)"/g)].map((m) => m[1]);
  const want = meta.sections.map((s) => s.id);
  if (ids.join() !== want.join()) fail(where, `sections are [${ids}] but the book has [${want}]`);

  // 3. Every <JavaCode> region exists.
  for (const m of src.matchAll(/<JavaCode file="([^"]+)" region="([^"]+)"/g)) checkRegion(where, m[1], m[2]);

  // 4. Every visualiser used is registered for /playground.
  const used = [...src.matchAll(/<([A-Z]\w+)\b[^>]*client:visible/g)].length; // every island in a chapter is a visualiser
  const registered = VISUALIZERS.filter((v) => v.chapter === num).length;
  if (used !== registered) fail(where, `${used} visualisers embedded but ${registered} listed in src/data/visualizers.ts`);

  // 5. Quiz, practice, cheat sheet and flashcards exist and are big enough.
  const extrasPath = join(root, `src/data/chapters/ch${String(num).padStart(2, '0')}.ts`);
  if (!existsSync(extrasPath)) { fail(where, `missing ${extrasPath}`); continue; }
  const { default: x } = await import(extrasPath);
  const min = meta.condensed ? { quiz: 5, practice: 3, cheatsheet: 3, flashcards: 4 } : { quiz: 8, practice: 6, cheatsheet: 5, flashcards: 6 };
  for (const [k, n] of Object.entries(min)) if ((x[k]?.length ?? 0) < n) fail(extrasPath, `${k} has ${x[k]?.length ?? 0} items, need ≥ ${n}`);
  x.quiz.forEach((q, i) => {
    if (q.answer < 0 || q.answer >= q.options.length) fail(extrasPath, `quiz ${i + 1}: answer index out of range`);
    if (!q.explain?.en || !q.explain?.hi) fail(extrasPath, `quiz ${i + 1}: needs an explanation in both languages`);
  });
  for (const p of x.practice) {
    if (csesById.get(p.id) !== p.name) fail(extrasPath, `CSES #${p.id} is "${csesById.get(p.id)}", not "${p.name}"`);
    if (!want.includes(p.section)) fail(extrasPath, `practice "${p.name}" points at unknown section ${p.section}`);
  }
}

// 6. Every `@java/...?region=` import in the visualisers points at a real region.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
}
for (const file of walk(join(root, 'src/viz')).filter((f) => f.endsWith('.tsx'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/from '@java\/([^?']+)\?region=([\w-]+)'/g)) checkRegion(file.replace(root + '/', ''), m[1], m[2]);
}

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('✓ content lint passed');
