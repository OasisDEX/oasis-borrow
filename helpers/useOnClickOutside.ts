import React, { useEffect } from 'react'

export function useOnClickOutside(ref: React.RefObject<HTMLDivElement>, cb: Function) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        cb()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])
}
