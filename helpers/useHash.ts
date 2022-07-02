import { useCallback, useEffect, useState } from 'react'

export function useHash(): [string, (newHash: string) => void] {
  const [hash, setHash] = useState(window?.location.hash)

  const hashChange = useCallback(() => {
    setHash(window?.location.hash)
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', hashChange)
    return () => {
      window.removeEventListener('hashchange', hashChange)
    }
  }, [])

  const updateHash = useCallback(
    (newHash) => {
      if (newHash !== hash) {
        window.location.hash = newHash
      }
    },
    [hash],
  )

  return [hash.replace('#', ''), updateHash]
}
