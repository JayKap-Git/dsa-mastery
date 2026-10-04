import { useEffect, useRef } from 'react';

/**
 * Keeps the highlighted element of a horizontally scrolling view on screen (phones),
 * by scrolling the container itself — never the page.
 */
export function useKeepInView<T extends HTMLElement>(deps: unknown[], selector = '[class*="role-active"], [class*="role-changed"], [class*="role-compare"]') {
  const ref = useRef<T>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box || box.scrollWidth <= box.clientWidth) return;
    const target = box.querySelector<HTMLElement | SVGElement>(selector);
    if (!target) return;
    const b = box.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    if (t.left < b.left + 8 || t.right > b.right - 8) {
      box.scrollTo({ left: box.scrollLeft + (t.left - b.left) - b.width / 2 + t.width / 2, behavior: 'smooth' });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}
