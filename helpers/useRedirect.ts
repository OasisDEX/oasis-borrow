import { useRouter } from 'next/router'
import type { Dictionary } from 'ts-essentials'

export function useRedirect() {
  const router = useRouter()

  function push(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network
    const queryParams = network ? { ...query, network } : query

    void router.push({
      pathname: pathname,
      query: queryParams,
    })
  }

  function replace(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network
    const queryParams = network ? { ...query, network } : query

    void router.replace({
      pathname: pathname,
      query: queryParams,
    })
  }

  return { push, replace }
}
