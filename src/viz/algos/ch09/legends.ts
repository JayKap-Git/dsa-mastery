import type { LegendItem } from '../../engine/types';

export const L = {
  active: { role: 'active', label: { en: 'current', hi: 'abhi wala' } },
  compare: { role: 'compare', label: { en: 'being read', hi: 'padha ja raha' } },
  range: { role: 'range', label: { en: 'query range', hi: 'query range' } },
  done: { role: 'done', label: { en: 'used in answer', hi: 'answer mein use hua' } },
  changed: { role: 'changed', label: { en: 'just written', hi: 'abhi likha gaya' } },
  plus: { role: 'plus', label: { en: 'added (+)', hi: 'joda (+)' } },
  minus: { role: 'minus', label: { en: 'subtracted (−)', hi: 'ghataya (−)' } },
  path: { role: 'path', label: { en: 'path to root', hi: 'root tak ka path' } },
} satisfies Record<string, LegendItem>;
