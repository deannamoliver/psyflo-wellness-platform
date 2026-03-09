"server-only";

export function internalServerError(message: string): never {
  throw new Error(message);
}
