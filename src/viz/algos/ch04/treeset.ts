// TreeSet navigation on a sorted array of distinct values (what CollectionsTour.java does with java.util.TreeSet).

export type Query = 'ceiling' | 'floor' | 'higher' | 'lower' | 'nearest' | 'contains';

/** Index of the answer, or -1 for Java's null. */
export function navigate(s: number[], x: number, q: Query): number {
  const lb = s.findIndex((v) => v >= x); // first ≥ x
  const ub = s.findIndex((v) => v > x); // first > x
  const end = (i: number) => (i === -1 ? s.length : i);
  switch (q) {
    case 'contains':
      return s.indexOf(x);
    case 'ceiling':
      return lb;
    case 'higher':
      return ub;
    case 'floor':
      return end(ub) - 1;
    case 'lower':
      return end(lb) - 1;
    case 'nearest': {
      if (!s.length) return -1;
      const up = lb, down = end(ub) - 1;
      if (up === -1) return down;
      if (down === -1) return up;
      return x - s[down] <= s[up] - x ? down : up;
    }
  }
}

export const insertSorted = (s: number[], x: number) => (s.includes(x) ? s : [...s, x].sort((p, q) => p - q));
export const removeValue = (s: number[], x: number) => s.filter((v) => v !== x);

/** Where x would be inserted (0..n): the C++ lower_bound position. */
export const insertionPoint = (s: number[], x: number) => {
  const i = s.findIndex((v) => v >= x);
  return i === -1 ? s.length : i;
};
