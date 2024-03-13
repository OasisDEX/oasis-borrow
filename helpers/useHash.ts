import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export function useHash<T extends string>(): [string, (newHash: T) => void] {
  const { events } = useRouter()
  const [hash, setHash] = useState<T>(window?.location.hash.replace('#', '') as T)

  const hashChange = useCallback(() => {
    setHash(window?.location.hash.replace('#', '') as T)
  }, [])

  useEffect(() => {
    events.on('hashChangeComplete', hashChange)
    window.addEventListener('hashchange', hashChange)
    return () => {
      events.off('hashChangeComplete', hashChange)
      window.removeEventListener('hashchange', hashChange)
    }
  }, [hashChange, events])

  const updateHash = useCallback(
    (newHash: T) => {
      if (newHash !== hash) {
        window.location.hash = newHash
      }
    },
    [hash],
  )

  return [hash, updateHash]
}
