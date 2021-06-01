export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${val}`)
  }
}

export function unhandledCaseError(never: never): never {
  throw new UnreachableCaseError(never)
}
