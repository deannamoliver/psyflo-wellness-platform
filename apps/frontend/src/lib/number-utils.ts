export function rangeOf(start: number, end: number, step: number = 1) {
  return Array.from(
    { length: Math.floor((end - start) / step) + 1 },
    (_, i) => start + i * step,
  );
}
