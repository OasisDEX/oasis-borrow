import { useRouter } from 'next/router'
import { Dictionary } from 'ts-essentials'

export function useRedirect() {
  const router = useRouter()

  function push(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network;
    const queryParams = network ? {...query, network } : query
    
    router.push({pathname, query: queryParams})
  }

  function replace(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network;
    const queryParams = network ? {...query, network } : query

    router.replace({pathname, query: queryParams})
  }

  return { push, replace }
}
