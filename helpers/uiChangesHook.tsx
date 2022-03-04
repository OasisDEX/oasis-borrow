import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useState } from 'react'

export function useUIChanges<T>(topic: string) {
  const { uiChanges } = useAppContext()

  const [lastUIState, lastUIStateSetter] = useState<T | undefined>(uiChanges.lastPayload(topic))

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
