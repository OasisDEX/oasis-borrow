import { useContext } from 'react'

export function useSelectFromContext<T, U>(
  context: React.Context<T | undefined>,
  selector: (cxt: T) => U,
) {
  const ctxContents = useContext(context)
  if (!ctxContents) {
    throw new Error(`context ${typeof context} not available`)
  }
  return selector(ctxContents)
}
