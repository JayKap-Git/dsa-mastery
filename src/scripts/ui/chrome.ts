// Page chrome: language + theme toggles (synced as prefs), mobile menu, copy buttons, search, TOC highlight.
import { subscribe } from '../../lib/store/items';
import { pref, setPref } from '../../lib/store/selectors';

const root = document.documentElement;
const fast = {
  // The inline <head> script reads these keys before first paint, so keep them in step with the store.
  set(k: 'lang' | 'theme', v: string) {
    try {
      localStorage.setItem(`dsa-mastery:${k}`, v);
    } catch {
      /* ignore */
    }
  },
};

function syncLangButtons() {
  const lang = root.dataset.lang ?? 'en';
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
}

function applyPrefs() {
  const lang = pref('lang');
  if (lang && lang !== root.dataset.lang) {
    root.dataset.lang = lang;
    fast.set('lang', lang);
    syncLangButtons();
  }
  const theme = pref('theme');
  if (theme && theme !== root.dataset.theme) {
    root.dataset.theme = theme;
    fast.set('theme', theme);
  }
}

export function initChrome() {
  // Language
  document.querySelectorAll<HTMLButtonElement>('[data-set-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      const v = b.dataset.setLang!;
      root.dataset.lang = v;
      fast.set('lang', v);
      setPref('lang', v);
      syncLangButtons();
    }),
  );
  syncLangButtons();

  // Theme
  const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('[data-toggle-theme]').forEach((b) =>
    b.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      fast.set('theme', next);
      setPref('theme', next);
    }),
  );

  // Prefs changed on another device → apply here.
  subscribe((source) => source === 'remote' && applyPrefs());

  // Mobile menu
  const menuBtn = document.querySelector<HTMLButtonElement>('[data-toggle-menu]');
  menuBtn?.addEventListener('click', () => {
    const open = document.getElementById('mobile-nav')!.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Copy buttons on code blocks
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

  initSearch();
  initTocHighlight();
}

function initSearch() {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  let ready = false;
  async function open() {
    if (!dialog) return;
    dialog.showModal();
    if (ready) {
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
      ready = true;
      setTimeout(() => dialog.querySelector<HTMLInputElement>('input')?.focus(), 50);
    } catch {
      document.getElementById('search-note')!.hidden = false;
    }
  }
  document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', open));
  document.querySelector('[data-close-search]')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !dialog?.open) {
      e.preventDefault();
      open();
    }
  });
}

function initTocHighlight() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const obs = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((a) => a.classList.remove('active'));
        byId.get(en.target.id)?.classList.add('active');
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}
