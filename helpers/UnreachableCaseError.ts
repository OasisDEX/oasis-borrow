export class UnreachableCaseError extends Error {
  constructor(val: unknown) {
    super(`Unreachable case: ${val}`)
  }
}
