// Site-wide behaviour: language + theme toggles, mobile menu, copy buttons, search, progress UI.
import { PROGRESS_EVENT, exportJson, importJson, load, setSection, touch } from '../lib/progress';

const root = document.documentElement;
const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

// ── Language ──
function syncLangButtons() {
  const lang = root.dataset.lang ?? 'en';
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
}
document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((b) =>
  b.addEventListener('click', () => {
    root.dataset.lang = b.dataset.setLang;
    store.set('dsa-mastery:lang', b.dataset.setLang!);
    syncLangButtons();
  }),
);
syncLangButtons();

// ── Theme ──
const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
document.querySelector('[data-toggle-theme]')?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('dsa-mastery:theme', next);
});

// ── Mobile menu ──
const menuBtn = document.querySelector<HTMLButtonElement>('[data-toggle-menu]');
menuBtn?.addEventListener('click', () => {
  const open = document.getElementById('mobile-nav')!.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

// ── Copy buttons on code blocks ──
document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
  if (!btn) return;
  const src = btn.closest('.codeblock')?.querySelector<HTMLTextAreaElement>('textarea.raw');
  if (!src) return;
  try {
    await navigator.clipboard.writeText(src.value);
    btn.textContent = 'Copied';
  } catch {
    btn.textContent = 'Press ⌘C';
    src.hidden = false;
    src.select();
  }
  setTimeout(() => (btn.textContent = 'Copy'), 1600);
});

// ── Search (Pagefind, loaded on first open) ──
const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
let searchReady = false;
async function openSearch() {
  if (!dialog) return;
  dialog.showModal();
  if (searchReady) {
    dialog.querySelector<HTMLInputElement>('input')?.focus();
    return;
  }
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/pagefind/pagefind-ui.css';
    document.head.appendChild(link);
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/pagefind/pagefind-ui.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('pagefind missing'));
      document.head.appendChild(s);
    });
    // @ts-expect-error — global from pagefind-ui.js
    new PagefindUI({ element: '#search-root', showSubResults: true, showImages: false, resetStyles: false });
    searchReady = true;
    setTimeout(() => dialog.querySelector<HTMLInputElement>('input')?.focus(), 50);
  } catch {
    document.getElementById('search-note')!.hidden = false;
  }
}
document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', openSearch));
document.querySelector('[data-close-search]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
document.addEventListener('keydown', (e) => {
  const tag = (e.target as HTMLElement).tagName;
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !dialog?.open) {
    e.preventDefault();
    openSearch();
  }
});

// ── Progress UI ──
const chapterSlug = document.querySelector<HTMLElement>('main[data-chapter]')?.dataset.chapter;
if (chapterSlug) touch(chapterSlug);

function renderProgress() {
  const p = load();
  // section checkboxes
  document.querySelectorAll<HTMLInputElement>('input[data-section-check]').forEach((box) => {
    box.checked = !!chapterSlug && (p.chapters[chapterSlug]?.sections ?? []).includes(box.dataset.sectionCheck!);
  });
  // toc ticks
  document.querySelectorAll<HTMLAnchorElement>('a[data-toc-section]').forEach((a) => {
    a.classList.toggle('is-done', !!chapterSlug && (p.chapters[chapterSlug]?.sections ?? []).includes(a.dataset.tocSection!));
  });
  // meters: data-progress-chapter="slug" data-total="4"
  document.querySelectorAll<HTMLElement>('[data-progress-chapter]').forEach((el) => {
    const slug = el.dataset.progressChapter!;
    const total = Number(el.dataset.total) || 1;
    const c = p.chapters[slug];
    const done = c?.sections.length ?? 0;
    const pct = Math.round((Math.min(done, total) / total) * 100);
    el.style.setProperty('--pct', `${pct}%`);
    const label = el.querySelector<HTMLElement>('[data-progress-text]');
    if (label) label.textContent = `${Math.min(done, total)}/${total}`;
    const quiz = el.querySelector<HTMLElement>('[data-quiz-text]');
    if (quiz) quiz.textContent = c?.quiz ? `Quiz ${c.quiz.score}/${c.quiz.total}` : '';
  });
  // dashboard summary
  const sectionsDone = Object.values(p.chapters).reduce((s, c) => s + c.sections.length, 0);
  const quizzes = Object.values(p.chapters).filter((c) => c.quiz).length;
  document.querySelectorAll<HTMLElement>('[data-stat="sections"]').forEach((el) => (el.textContent = String(sectionsDone)));
  document.querySelectorAll<HTMLElement>('[data-stat="quizzes"]').forEach((el) => (el.textContent = String(quizzes)));
  const cont = document.querySelector<HTMLAnchorElement>('[data-continue]');
  if (cont && p.last) {
    const title = document.querySelector<HTMLElement>(`[data-chapter-title="${p.last}"]`)?.dataset.title;
    cont.href = `/chapters/${p.last}/`;
    const t = cont.querySelector('[data-continue-label]');
    if (t && title) t.textContent = `Continue: ${title}`;
  }
}

document.querySelectorAll<HTMLInputElement>('input[data-section-check]').forEach((box) =>
  box.addEventListener('change', () => chapterSlug && setSection(chapterSlug, box.dataset.sectionCheck!, box.checked)),
);
window.addEventListener(PROGRESS_EVENT, renderProgress);
window.addEventListener('storage', renderProgress);
renderProgress();

// Export / import progress (dashboard)
document.querySelector('[data-export-progress]')?.addEventListener('click', () => {
  const blob = new Blob([exportJson()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dsa-mastery-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.querySelector<HTMLInputElement>('[data-import-progress]')?.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const ok = importJson(await file.text());
  alert(ok ? 'Progress imported.' : 'That file is not a DSA Mastery progress export.');
});

// ── Highlight the current section in the chapter table of contents ──
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(tocLinks.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const obs = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        tocLinks.forEach((a) => a.classList.remove('active'));
        byId.get(en.target.id)?.classList.add('active');
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
}
