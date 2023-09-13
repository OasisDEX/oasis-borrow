export function ensureFind<T>(
  argument: T | undefined | null,
  message: string = 'Ensured value was undefined or null',
): T {
  if (argument === undefined || argument === null) {
    throw new TypeError(message)
  }

  return argument
}
