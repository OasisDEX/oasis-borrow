import { useState } from 'react'

export default function useHasChangedSinceFirstRender<T>(state: T): boolean {
  const [hasChanged, setHasChanged] = useState(false)
  const [previousState, setPreviousState] = useState<T>(state)
  if (state !== previousState) {
    setHasChanged(true)
    setPreviousState(state)
  }

  return hasChanged
}
