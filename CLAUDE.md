# DSA Mastery — authoring guide

Interactive study site for *Competitive Programmer's Handbook* (Antti Laaksonen, 2018 draft, CC BY-NC-SA 4.0).
Astro 7 static site + React islands, deployed by GitHub Actions to GitHub Pages at **dsa.jayantkapoor.com**.
The reader is Jayant: intermediate DSA, writes **Java only**, wants English + **Hinglish** explanations.

## Accounts and sync (stateful layer)
- The site stays static. State lives in `src/lib/store/` (offline-first, localStorage) and syncs to the
  **Worker in `api/`** (Hono + D1) at `api.jayantkapoor.com` when the user signs in with GitHub.
- Every synced thing is an **item** `(kind, key, value, updatedAt)`; rules + limits in `src/lib/store/kinds.ts`,
  shared by client and Worker. Merge = last-writer-wins on `updatedAt` (quiz attempts are append-only keys).
  New kind? Add it to `kinds.ts` (key regex + value check), then selectors/actions in `selectors.ts`.
- UI code never touches localStorage directly: read with selectors, write with the actions in `selectors.ts`,
  re-render via `subscribe()` (vanilla, in `src/scripts/ui/*`) or `useStore()` (React).
- Anonymous visitors make **zero** API calls; only a browser that signed in before calls `/me` and syncs.
- `api/`: `npm run dev` (local D1 + `wrangler dev` on :8787, uses `.dev.vars` with `DEV_LOGIN=true`),
  `npm test` (Workers runtime via @cloudflare/vitest-pool-workers), `npm run typecheck`, `npm run deploy`.
  Schema changes = a new file in `api/migrations/` (never edit an applied one).
- Local end-to-end: run `npm run dev` in both `api/` and the root, then drive two Chrome profiles with
  `node scripts/shoot.mjs <url> out.png --profile <dir> --pre "<dev-login fetch>" --eval "<checks>"`.

## Commands
- `npm run dev` / `npm run build` (astro build + pagefind) / `npm run preview`
- `npm run verify` — astro check → vitest → Java tests → content lint → build. Must pass before every commit.
  Also run `npm test` and `npm run typecheck` in `api/` when touching the store or the Worker.
- `npm run java:test` — compiles `java/src/**` with `javac --release 11 -Xlint:all -Werror`, runs every `main()`.
- `npm run lint:content` — En/Hi pairing, book section ids, Java regions, extras sizes, CSES ids, playground registry.
- `npm run extract` — dumps the book into `.book-text/chNN.txt` (gitignored; needs `book.pdf`, macOS PDFKit).
- `node scripts/shoot.mjs <url> <out.png> [--mobile] [--full] [--eval js]` — headless-Chrome screenshot + console errors.
  Supports `?lang=en|hi|both&theme=light|dark` URL params.

## Never
- Never commit `book.pdf` or `.book-text/` (gitignored). Link to https://cses.fi/book/book.pdf instead.
- Never guess CSES ids — they are checked against `src/data/cses.json` (scraped from cses.fi/problemset).
- No ads or monetisation (license is non-commercial). Keep the credit in the footer and /about.

## Adding a chapter (repeat this recipe)
1. Read `.book-text/chNN.txt`. Section ids and titles come from `src/data/catalog.ts` (already filled for all 30).
2. **Java first** — `java/src/chNN/Name.java`, `package chNN;`, idiomatic Java 11 (no records/`var`-heavy code/text blocks).
   - Wrap displayable parts in `// #region name` … `// #endregion` (nesting allowed; markers are stripped).
   - Mark lines a visualiser highlights with a trailing `// @step label` (several: `// @step a,b`).
   - `main()` checks the book's own example **and** random cases against brute force; throw `AssertionError` on failure.
   - `long` for sums; Fenwick trees 1-indexed like the book; everything else 0-indexed unless stated.
3. **Tracers** — `src/viz/algos/chNN/name.ts`: pure `input → Frame<S>[]`, mirroring the Java line for line.
   Every frame: `say: { en, hi }`, `step` = labels that exist in the Java region, `vars` for the watch panel.
   Tests in `chNN.test.ts` use `expectValidFrames()` from `src/viz/algos/testing.ts` + brute-force comparisons
   + the book's example values.
4. **Visualiser component** — `src/viz/algos/chNN/NameViz.tsx`: `VizShell` + controls + `Player`, code via
   `import code from '@java/chNN/Name.java?region=x'`. Book example is the default input; add Random.
   Reuse views in `src/viz/views/` (ArrayView, GridView, HeapTreeView, FenwickBars); add new views there.
   Register it in `src/data/visualizers.ts`.
5. **MDX** — `src/content/chapters/NN-slug.mdx`. Frontmatter: `num`, `minutes`, `prerequisites`, `learn[{en,hi}]`.
   Body: short intro, then one `<Section id="N.k" title="…">` per book section, each with `###` subsections.
   Components available without import: `En, Hi, Tx, Section, Callout, JavaCode, Complexity`.
   Visualisers must be imported and used with `client:visible`.
   **MDX gotcha:** leave a blank line after `<En>`/`<Hi>`/`<Callout>` opening tags and before closing tags.
6. **Extras** — `src/data/chapters/chNN.ts` (`ChapterExtras`): quiz (≥ 8, mix concept/trace/complexity/java, verify
   trace answers with the tracers), practice (≥ 6 CSES, easy→hard, each tied to a section), cheatsheet (≥ 5), flashcards (≥ 6).
7. Condensed chapters (1–4) use the same pieces with lower minimums (quiz ≥ 5, practice ≥ 3, cheatsheet ≥ 3, flashcards ≥ 4).
8. `npm run verify`, then screenshot desktop + `--mobile` in all three languages and both themes.

## Writing style
- **English**: plain, direct, short sentences. Rewrite the book in our own words; keep its examples and numbers.
- **Hinglish**: Roman script, *friendly teacher* voice, address the reader as **"tum"** ("socho", "dhyaan do",
  "ab dekhte hain"). Technical terms stay English (array, node, query, O(log n)). Re-explain with intuition —
  never a word-for-word translation — but the same facts, numbers and examples. Occasional everyday analogies are fine.
- Every `<En>` is immediately followed by its `<Hi>`. Headings stay English.
- In components, `ui` (on `<T>` / `<Tx>`) marks interface chrome: in "Both" mode it shows English only.
- Java notes call out where Java differs from the book's C++ (overflow, `TreeSet` vs `std::set`, `lower_bound`
  → `ceiling`/`Collections.binarySearch`, `Arrays.sort(int[])` anti-quicksort, recursion depth, fast I/O).

## Layout of the code
- `src/data/catalog.ts` — all 30 chapters (titles, parts, pages, sections, bilingual blurbs).
- `src/lib/java-source.mjs` — region/step parser + Shiki highlighting (used by the Vite plugin, `JavaCode.astro`, the linter).
- `src/viz/engine/` — `Player` (transport, code sync, watch), `controls`, `T`/`useLang`, types (`Frame`, `Role`, `Bi`).
- `src/lib/progress.ts` + `src/scripts/site.ts` — localStorage progress, toggles, search, copy buttons.
- `src/styles/global.css` — tokens (light/dark), language rules, every component's styles.
