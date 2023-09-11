import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Hook to run an async effect on mount and another on unmount.
 */
export const useAsyncEffect = (
  mountCallback: () => Promise<any>,
  unmountCallback: () => Promise<any>,
  deps: any[] = [],
): UseAsyncEffectResult => {
  const isMounted = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(undefined)
  const [result, setResult] = useState<any>()

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    let ignore = false
    let mountSucceeded = false

    void (async () => {
      await Promise.resolve() // wait for the initial cleanup in Strict mode - avoids double mutation
      if (!isMounted.current || ignore) {
        return
      }
      setIsLoading(true)
      try {
        const result = await mountCallback()
        mountSucceeded = true
        if (isMounted.current && !ignore) {
          setError(undefined)
          setResult(result)
          setIsLoading(false)
        } else {
          // Component was unmounted before the mount callback returned, cancel it
          void unmountCallback()
        }
      } catch (innerError) {
        if (!isMounted.current) return
        setError(innerError)
        setIsLoading(false)
      }
    })()

    return () => {
      ignore = true
      if (mountSucceeded) {
        unmountCallback()
          .then(() => {
            if (!isMounted.current) return
            setResult(undefined)
          })
          .catch((innerError: unknown) => {
            if (!isMounted.current) return
            setError(innerError)
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return useMemo(() => ({ result, error, isLoading }), [result, error, isLoading])
}

export interface UseAsyncEffectResult {
  result: any
  error: any
  isLoading: boolean
}
