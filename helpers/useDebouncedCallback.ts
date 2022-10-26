import { debounce } from 'lodash'
import { useCallback, useEffect } from 'react'

// Hook which listen for given value changes and after specified delay when change does not occur calls callback
export function useDebouncedCallback<T>(
  callback: (value: T) => void,
  value: T,
  delay: number = 1000, // milliseconds
) {
  const debouncedCallback = useCallback(debounce(callback, delay), [])

  useEffect(() => {
    debouncedCallback(value)
  }, [value])
}
