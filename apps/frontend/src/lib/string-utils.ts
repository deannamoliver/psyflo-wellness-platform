/**
 * Converts a string to title case, capitalizing the first letter of each word.
 * Words listed in `ignore` will not be capitalized.
 *
 * Words are split using `delimiter` and joined using `separator`.
 *
 * Example:
 *
 * ```ts
 * titleCase('hello world');
 * Output: Hello World
 *
 * titleCase('hello_world', { delimiter: '_', separator: '-' });
 * Output: Hello-World
 *
 * titleCase('HELLO_WORLD', { delimiter: '_', ignore: ['HELLO'] });
 * Output: Hello World
 *
 * titleCase('HELLO_WORLD', { ignore: ['HELLO'] });
 * Output: HELLO_WORLD // Default delimiter is ' ' so HELLO_WORLD not split
 *
 * titleCase('HELLO_WORLD', { ignore: ['HELLO'], separator: '-' });
 * Output: HELLO-World
 * ```
 */
export function titleCase(
  value: string,
  options: {
    delimiter?: string;
    separator?: string;
    ignore?: string[];
  } = {},
): string {
  const { delimiter = " ", separator = " ", ignore = [] } = options;

  return value
    .split(delimiter)
    .filter((word) => word.length > 0)
    .map((word) => {
      if (ignore.includes(word)) {
        return word;
      }
      return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(separator);
}

export function fmtOrdinal(value: number): string {
  const v = value % 100;

  if (v > 3 && v < 20) {
    return `${value}th`;
  }

  if (v % 10 === 1) {
    return `${value}st`;
  }

  if (v % 10 === 2) {
    return `${value}nd`;
  }

  if (v % 10 === 3) {
    return `${value}rd`;
  }

  return `${value}th`;
}

export function fmtUserName({
  firstName,
  lastName,
}: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const name = [];

  if (firstName) {
    name.push(firstName);
  }

  if (lastName) {
    name.push(lastName);
  }

  return name.join(" ");
}

export function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function getInitials(value: string, size: number = 2): string {
  return value
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .filter((char) => char != null)
    .slice(0, size)
    .join("");
}
