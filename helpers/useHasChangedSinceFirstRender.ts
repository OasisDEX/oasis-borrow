import { useState } from 'react'

type Comparable = string | boolean | number

export function useHasChangedSinceFirstRender<T extends Comparable>(state: T): boolean {
  const [hasChanged, setHasChanged] = useState(false)
  const [previousState, setPreviousState] = useState<T>(state)
  if (state !== previousState) {
    setHasChanged(true)
    setPreviousState(state)
  }

  return hasChanged
}
