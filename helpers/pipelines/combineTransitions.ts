export function combineTransitions<S>(...transitions: ((state: S) => S)[]): (state: S) => S {
  return (state: S) => transitions.reduce((nextState, transition) => transition(nextState), state)
}
