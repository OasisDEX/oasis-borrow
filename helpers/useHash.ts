import { useCallback, useEffect, useState } from 'react'

export function useHash<T extends string>(): [string, (newHash: T) => void] {
  const [hash, setHash] = useState<T>(window?.location.hash.replace('#', '') as T)

  const hashChange = useCallback(() => {
    setHash(window?.location.hash as T)
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', hashChange)
    return () => {
      window.removeEventListener('hashchange', hashChange)
    }
  }, [])

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
