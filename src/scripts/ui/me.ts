// /me/ — your study dashboard: progress per chapter, all notes, CSES solutions, export, delete account.
import { exportLocal, subscribe } from '../../lib/store/items';
import { allCses, allNotes, bestQuiz, quizHistory, sectionsDone, solvedCount, streak } from '../../lib/store/selectors';
import { cachedUser, deleteAccount, exportUrl, onAccountChange } from '../../lib/store/sync';
import { toast } from './account';

interface MeData {
  chapters: { slug: string; num: number; title: string; ready: boolean; sections: { id: string; title: string }[]; cses: number[] }[];
  cses: Record<string, string>; // id → name
}

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { className?: string } = {}, ...kids: (Node | string | null)[]) => {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...kids.filter((k): k is Node | string => k !== null));
  return el;
};

function download(name: string, data: unknown) {
  const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}

export function initMe() {
  const dataEl = document.getElementById('me-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent!) as MeData;
  const bySlug = new Map(data.chapters.map((c) => [c.slug, c]));

  const render = () => {
    // Per-chapter table
    const tbody = document.querySelector('[data-me-chapters]')!;
    tbody.replaceChildren(
      ...data.chapters.filter((c) => c.ready).map((c) => {
        const best = bestQuiz(c.slug);
        const attempts = quizHistory(c.slug).length;
        return h('tr', {},
          h('td', {}, h('a', { href: `/chapters/${c.slug}/` }, `${c.num}. ${c.title}`)),
          h('td', {}, `${sectionsDone(c.slug).length}/${c.sections.length}`),
          h('td', {}, best ? `${best.score}/${best.total} (${attempts} attempt${attempts === 1 ? '' : 's'})` : '—'),
          h('td', {}, c.cses.length ? `${solvedCount(c.cses)}/${c.cses.length}` : '—'),
        );
      }),
    );

    document.querySelectorAll<HTMLElement>('[data-me-stat]').forEach((el) => {
      const k = el.dataset.meStat;
      el.textContent = String(
        k === 'streak' ? streak() : k === 'notes' ? allNotes().length : k === 'solved' ? solvedCount() : '',
      );
    });

    // Notes, grouped by chapter
    const notes = allNotes().sort((a, b) => (bySlug.get(a.slug)?.num ?? 99) - (bySlug.get(b.slug)?.num ?? 99) || a.section.localeCompare(b.section, undefined, { numeric: true }));
    const notesEl = document.querySelector('[data-me-notes]')!;
    notesEl.replaceChildren(
      ...(notes.length
        ? notes.map((n) => {
            const ch = bySlug.get(n.slug);
            const title = ch?.sections.find((s) => s.id === n.section)?.title ?? '';
            return h('article', { className: 'me-note' },
              h('a', { href: `/chapters/${n.slug}/#s${n.section.replace('.', '-')}`, className: 'me-note-head' }, `${n.section} ${title}`, h('small', {}, ch ? ` · ${ch.title}` : '')),
              h('pre', { className: 'note-text' }, n.text),
            );
          })
        : [h('p', { className: 'muted' }, 'No notes yet. Open any section and use “My notes”.')]),
    );

    // CSES solutions
    const sol = allCses().filter((e) => e.status !== 'todo' || e.code).sort((a, b) => b.updatedAt - a.updatedAt);
    const solEl = document.querySelector('[data-me-cses]')!;
    solEl.replaceChildren(
      ...(sol.length
        ? sol.map((e) =>
            h('details', { className: 'me-sol' },
              h('summary', {},
                h('span', { className: `status-chip ${e.status}` }, e.status),
                h('a', { href: `https://cses.fi/problemset/task/${e.id}`, target: '_blank', rel: 'noopener' }, data.cses[String(e.id)] ?? `#${e.id}`),
                h('small', { className: 'muted' }, e.code ? ' · Java solution saved' : ''),
              ),
              e.code ? h('pre', { className: 'code-plain' }, e.code) : h('p', { className: 'muted' }, 'No code saved.'),
            ),
          )
        : [h('p', { className: 'muted' }, 'Mark CSES problems on any chapter’s practice list to track them here.')]),
    );
  };

  document.querySelector('[data-export-account]')?.addEventListener('click', async () => {
    if (!cachedUser()) return download('dsa-mastery-this-device.json', exportLocal());
    try {
      const r = await fetch(exportUrl(), { credentials: 'include' });
      if (!r.ok) throw new Error(String(r.status));
      download('dsa-mastery-export.json', await r.json());
    } catch {
      toast('Export failed. Check your connection and try again.', 'error');
    }
  });

  document.querySelector('[data-delete-account]')?.addEventListener('click', async () => {
    const typed = prompt('This permanently deletes your account, progress, notes and solutions from the server.\nType DELETE to confirm.');
    if (typed !== 'DELETE') return;
    toast((await deleteAccount()) ? 'Your account and all its data were deleted.' : 'Couldn’t delete right now. Please try again.', 'ok');
  });

  subscribe(render);
  onAccountChange(render);
  render();
}
