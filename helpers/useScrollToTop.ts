import { useEffect } from 'react'

/*
 * This hook will scroll to the top of the page when the component is mounted.
 */
export function useScrollToTop() {
  useEffect(() => {
    document.querySelectorAll('body')[0]?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return null // takes nothing, returns nothing
}
