import { useEffect } from 'react'

/*
 * This hook will scroll to the top of the page when the component is mounted.
 */
export function useScrollToTop(reScrollParam?: any) {
  useEffect(() => {
    document.querySelectorAll('body')[0]?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [reScrollParam]) // if this changes - scroll to top (used when switching product pages)
  return null
}
