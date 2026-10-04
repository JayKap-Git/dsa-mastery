// Section checkboxes, TOC ticks, progress meters, dashboard stats, streak and heatmap.
import { subscribe } from '../../lib/store/items';
import {
  allSectionsDone, bestQuiz, heatmap, lastChapter, quizzedChapters, sectionsDone, setSectionDone, solvedCount, streak, visit,
} from '../../lib/store/selectors';

const chapterSlug = () => document.querySelector<HTMLElement>('main[data-chapter]')?.dataset.chapter;

function render() {
  const slug = chapterSlug();
  const done = slug ? sectionsDone(slug) : [];

  document.querySelectorAll<HTMLInputElement>('input[data-section-check]').forEach((box) => {
    box.checked = done.includes(box.dataset.sectionCheck!);
  });
  document.querySelectorAll<HTMLAnchorElement>('a[data-toc-section]').forEach((a) => {
    a.classList.toggle('is-done', done.includes(a.dataset.tocSection!));
  });

  // Meters: data-progress-chapter="slug" data-total="4" [data-cses-ids="1646,1647"]
  document.querySelectorAll<HTMLElement>('[data-progress-chapter]').forEach((el) => {
    const s = el.dataset.progressChapter!;
    const total = Number(el.dataset.total) || 1;
    const n = Math.min(sectionsDone(s).length, total);
    el.style.setProperty('--pct', `${Math.round((n / total) * 100)}%`);
    const label = el.querySelector<HTMLElement>('[data-progress-text]');
    if (label) label.textContent = `${n}/${total}`;
    const quiz = el.querySelector<HTMLElement>('[data-quiz-text]');
    const best = bestQuiz(s);
    if (quiz) quiz.textContent = best ? `Quiz ${best.score}/${best.total}` : '';
    const solved = el.querySelector<HTMLElement>('[data-solved-text]');
    const ids = (el.dataset.csesIds ?? '').split(',').filter(Boolean).map(Number);
    if (solved && ids.length) solved.textContent = `CSES ${solvedCount(ids)}/${ids.length}`;
  });

  // Dashboard
  const stat = (name: string, v: string | number) =>
    document.querySelectorAll<HTMLElement>(`[data-stat="${name}"]`).forEach((el) => (el.textContent = String(v)));
  stat('sections', allSectionsDone());
  stat('quizzes', quizzedChapters());
  stat('solved', solvedCount());
  stat('streak', streak());

  const map = document.querySelector<HTMLElement>('[data-heatmap]');
  if (map) {
    const cells = heatmap(16);
    map.replaceChildren(
      ...cells.map((c) => {
        const i = document.createElement('i');
        i.className = c.future ? 'hm future' : c.active ? 'hm on' : 'hm';
        i.title = `${c.date}${c.active ? ' · studied' : ''}`;
        return i;
      }),
    );
  }

  const cont = document.querySelector<HTMLAnchorElement>('[data-continue]');
  const last = lastChapter();
  if (cont && last) {
    const title = document.querySelector<HTMLElement>(`[data-chapter-title="${last}"]`)?.dataset.title;
    if (title) {
      cont.href = `/chapters/${last}/`;
      const t = cont.querySelector('[data-continue-label]');
      if (t) t.textContent = `Continue: ${title}`;
    }
  }
}

export function initProgress() {
  const slug = chapterSlug();
  if (slug) visit(slug);
  document.querySelectorAll<HTMLInputElement>('input[data-section-check]').forEach((box) =>
    box.addEventListener('change', () => slug && setSectionDone(slug, box.dataset.sectionCheck!, box.checked)),
  );
  subscribe(render);
  render();
}
