import { useMemo, useSyncExternalStore } from 'react';
import { getVersion, subscribe } from './items';

/** Re-computes `select()` whenever the store changes (this device, another tab, or a sync). */
export function useStore<T>(select: () => T): T {
  const version = useSyncExternalStore((cb) => subscribe(() => cb()), getVersion, () => -1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (version < 0 ? (undefined as T) : select()), [version]);
}
