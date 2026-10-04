// "My notes" under every section: autosaved locally, synced when signed in.
import { subscribe } from '../../lib/store/items';
import { note, setNote } from '../../lib/store/selectors';
import { cachedUser, onAccountChange, syncStatus } from '../../lib/store/sync';

const statusText = () => {
  if (!cachedUser()) return 'Saved on this device · sign in to sync';
  const s = syncStatus();
  return s === 'syncing' ? 'Saved · syncing…' : s === 'offline' || s === 'error' ? 'Saved on this device · will sync when back online' : 'Saved · synced to your account';
};

export function initNotes() {
  const slug = document.querySelector<HTMLElement>('main[data-chapter]')?.dataset.chapter;
  const boxes = [...document.querySelectorAll<HTMLTextAreaElement>('textarea[data-note]')];
  if (!slug || !boxes.length) return;
  // Notes with unsaved typing: never overwrite them from the store.
  const dirty = new Set<HTMLTextAreaElement>();

  const fill = () => {
    for (const ta of boxes) {
      const text = note(slug, ta.dataset.note!);
      if (!dirty.has(ta) && document.activeElement !== ta && ta.value !== text) ta.value = text;
      const details = ta.closest('details');
      details?.classList.toggle('has-note', !!text.trim());
      if (text.trim() && details && !details.dataset.touched) details.open = true;
    }
  };

  for (const ta of boxes) {
    const status = ta.parentElement!.querySelector<HTMLElement>('[data-note-status]');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      clearTimeout(timer);
      dirty.delete(ta);
      const ok = setNote(slug, ta.dataset.note!, ta.value);
      if (status) status.textContent = ok ? statusText() : 'Not saved: notes are limited to 20,000 characters';
    };
    ta.addEventListener('input', () => {
      dirty.add(ta);
      if (status) status.textContent = 'Typing…';
      clearTimeout(timer);
      timer = setTimeout(save, 800);
    });
    ta.addEventListener('blur', () => dirty.has(ta) && save());
    ta.closest('details')?.addEventListener('toggle', (e) => ((e.currentTarget as HTMLElement).dataset.touched = '1'));
    if (status) status.textContent = note(slug, ta.dataset.note!) ? statusText() : '';
  }

  subscribe((source) => source === 'remote' && fill());
  onAccountChange(() =>
    boxes.forEach((ta) => {
      const st = ta.parentElement!.querySelector<HTMLElement>('[data-note-status]');
      if (st && ta.value) st.textContent = statusText();
    }),
  );
  fill();
}
