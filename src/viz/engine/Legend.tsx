import type { LegendItem } from './types';
import { T } from './T';

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="legend">
      {items.map((it) => (
        <li key={it.role}>
          <span className={`swatch role-${it.role}`} aria-hidden="true" />
          <T v={it.label} ui />
        </li>
      ))}
    </ul>
  );
}
