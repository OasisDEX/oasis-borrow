import { useEffect, useState } from 'react'

import { uiChanges } from './uiChanges'
import type { SupportedUIChangeType } from './uiChanges.types'

export function useUIChanges<T extends SupportedUIChangeType>(topic: string): T[] {
  const [lastUIState, lastUIStateSetter] = useState(uiChanges.lastPayload<T>(topic))

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<T>(topic)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return [lastUIState]
}
