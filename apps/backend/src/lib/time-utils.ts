export function dateOrNull(value: string | null | undefined): Date | null {
  if (value == null) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
