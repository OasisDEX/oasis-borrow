import { useEffect, useState } from 'react'
import { theme } from 'theme'

export function useBreakpointIndex() {
  const breakpoints = theme.breakpoints
  const [value, setValue] = useState(1)

  useEffect(() => {
    function getIndex() {
      return breakpoints.filter((bp) => window.matchMedia(`screen and (min-width: ${bp})`).matches)
        .length
    }

    function onResize() {
      const newValue = getIndex()
      if (value !== newValue) {
        setValue(newValue)
      }
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoints, value])

  return value
}

export function useOnMobile() {
  return useBreakpointIndex() === 0
}
