import { useEffect } from 'react'

export function useDebouncedEffect(
  fn: () => void,
  deps: unknown[],
  delay: number,
  notDebouncedFn?: () => void,
) {
  useEffect(() => {
    notDebouncedFn?.()
    const timeoutId = setTimeout(() => {
      fn()
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [...deps, delay])
}
