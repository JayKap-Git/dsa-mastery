import type { LegendItem } from './types';

export const L = {
  active: { role: 'active', label: { en: 'current', hi: 'abhi wala' } },
  compare: { role: 'compare', label: { en: 'being read', hi: 'padha ja raha' } },
  range: { role: 'range', label: { en: 'query range', hi: 'query range' } },
  done: { role: 'done', label: { en: 'used in answer', hi: 'answer mein use hua' } },
  changed: { role: 'changed', label: { en: 'just written', hi: 'abhi likha gaya' } },
  plus: { role: 'plus', label: { en: 'added (+)', hi: 'joda (+)' } },
  minus: { role: 'minus', label: { en: 'subtracted (−)', hi: 'ghataya (−)' } },
  path: { role: 'path', label: { en: 'path to root', hi: 'root tak ka path' } },
  sorted: { role: 'done', label: { en: 'in final place', hi: 'apni sahi jagah pe' } },
  left: { role: 'range', label: { en: 'left half / region', hi: 'left half / region' } },
  right: { role: 'compare', label: { en: 'right half / compared', hi: 'right half / compare ho raha' } },
  jump: { role: 'path', label: { en: 'jumped over', hi: 'jump kiya' } },
  muted: { role: 'muted', label: { en: 'ruled out', hi: 'bahar ho gaya' } },
} satisfies Record<string, LegendItem>;
