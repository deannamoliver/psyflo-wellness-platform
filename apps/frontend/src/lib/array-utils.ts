export function maxByOrNull<T>(array: T[], fn: (item: T) => number): T | null {
  const firstItem = array[0];
  if (!firstItem) {
    return null;
  }

  return array.reduce(
    (max, current) => (fn(current) > fn(max) ? current : max),
    firstItem,
  );
}

export function minByOrNull<T>(array: T[], fn: (item: T) => number): T | null {
  const firstItem = array[0];
  if (!firstItem) {
    return null;
  }

  return array.reduce(
    (min, current) => (fn(current) < fn(min) ? current : min),
    firstItem,
  );
}

export function sumOf(array: number[]): number {
  return array.reduce((sum, current) => sum + current, 0);
}

export function uniqueEntries<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function uniqueEntriesBy<T>(array: T[], fn: (item: T) => string): T[] {
  return array.filter(
    (item, index, self) => self.findIndex((t) => fn(t) === fn(item)) === index,
  );
}
