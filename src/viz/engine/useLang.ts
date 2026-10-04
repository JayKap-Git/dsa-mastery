import { useSyncExternalStore } from 'react';
import type { Lang } from './types';

const read = (): Lang => {
  const v = document.documentElement.dataset.lang;
  return v === 'hi' || v === 'both' ? v : 'en';
};

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  return () => obs.disconnect();
};

/** Follows the site-wide language toggle (`<html data-lang>`). Server render is always English. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => 'en');
}
