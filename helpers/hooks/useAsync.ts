import { useCallback, useEffect, useState } from 'react'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

export const useAsync = <T, E = string>(asyncFunction: Promise<T>, immediate = true) => {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus('pending')
    setValue(null)
    setError(null)
    return asyncFunction
      .then((response) => {
        setValue(response)
        setStatus('success')
      })
      .catch((error) => {
        setError(error)
        setStatus('error')
      })
  }, [asyncFunction])
  // Call execute if we want to fire it right away.
  // Otherwise, execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      void execute()
    }
  }, [execute, immediate])

  return { status, value, error }
}
