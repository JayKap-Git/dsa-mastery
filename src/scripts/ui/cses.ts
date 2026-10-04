// CSES tracker on practice lists: status per problem + your saved Java solution.
import { subscribe } from '../../lib/store/items';
import type { CsesStatus } from '../../../shared/kinds';
import { cses, setCses, solvedCount } from '../../lib/store/selectors';

export function initCses() {
  const rows = [...document.querySelectorAll<HTMLElement>('[data-cses]')];
  if (!rows.length) return;
  // Code boxes with unsaved typing: never overwrite them from the store.
  const dirty = new Set<HTMLTextAreaElement>();

  const render = () => {
    for (const row of rows) {
      const id = Number(row.dataset.cses);
      const entry = cses(id);
      const sel = row.querySelector<HTMLSelectElement>('[data-cses-status]')!;
      const code = row.querySelector<HTMLTextAreaElement>('[data-cses-code]')!;
      const status = entry?.status ?? 'todo';
      if (sel.value !== status) sel.value = status;
      if (!dirty.has(code) && document.activeElement !== code && code.value !== (entry?.code ?? '')) code.value = entry?.code ?? '';
      row.dataset.status = status;
      row.querySelector('details')?.classList.toggle('has-code', !!entry?.code);
    }
    document.querySelectorAll<HTMLElement>('[data-cses-count]').forEach((el) => {
      const ids = el.dataset.csesCount!.split(',').map(Number);
      el.textContent = `${solvedCount(ids)}/${ids.length} solved`;
    });
  };

  for (const row of rows) {
    const id = Number(row.dataset.cses);
    const sel = row.querySelector<HTMLSelectElement>('[data-cses-status]')!;
    const code = row.querySelector<HTMLTextAreaElement>('[data-cses-code]')!;
    const note = row.querySelector<HTMLElement>('[data-cses-saved]');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      clearTimeout(timer);
      dirty.delete(code);
      const text = code.value.trim() ? code.value : undefined;
      // Pasting a solution implies you at least attempted it.
      const status = (sel.value === 'todo' && text ? 'attempted' : sel.value) as CsesStatus;
      const ok = setCses(id, status, text);
      if (note) note.textContent = ok ? 'Saved' : 'Not saved: solutions are limited to 64,000 characters';
    };
    sel.addEventListener('change', save);
    code.addEventListener('input', () => {
      dirty.add(code);
      if (note) note.textContent = 'Typing…';
      clearTimeout(timer);
      timer = setTimeout(save, 800);
    });
    code.addEventListener('blur', () => dirty.has(code) && save());
    // Tab inserts spaces in the code box instead of leaving it.
    code.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || e.shiftKey) return;
      e.preventDefault();
      const { selectionStart: s, selectionEnd: t } = code;
      code.setRangeText('    ', s, t, 'end');
      code.dispatchEvent(new Event('input'));
    });
  }

  subscribe(render);
  render();
}
