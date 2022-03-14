import { useEffect, useRef } from 'react'

export function useOutsideElementClickHandler(cb: Function) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        cb()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  return elementRef
}
