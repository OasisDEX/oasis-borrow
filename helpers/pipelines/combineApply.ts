export type AnyChange = any
export function combineApplyChanges<S, Ch>(
  ...applyFunctions: ((state: S, change: AnyChange) => S)[]
): (state: S, change: Ch) => S {
  return (state: S, change: Ch) =>
    applyFunctions.reduce((nextState, apply) => apply(nextState, change), state)
}
