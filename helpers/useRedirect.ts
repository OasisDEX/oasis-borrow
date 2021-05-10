import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { Dictionary } from 'ts-essentials'

const basePath = getConfig()?.publicRuntimeConfig?.basePath

export function replaceBasePathIfNeeded(pathname: string, basePath: string) {
  // basePath could be either an 'empty string' or '/<something>'.
  // '/' is not a valid base path.
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.replace(new RegExp(`^${basePath}`), '') || '/'
  }

  return pathname
}

export function useRedirect() {
  const router = useRouter()

  function push(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network
    const queryParams = network ? { ...query, network } : query

    void router.push({
      pathname: replaceBasePathIfNeeded(pathname, basePath),
      query: queryParams,
    })
  }

  function replace(pathname: string, query: Dictionary<string> = {}) {
    const network = router.query.network
    const queryParams = network ? { ...query, network } : query

    void router.replace({
      pathname: replaceBasePathIfNeeded(pathname, basePath),
      query: queryParams,
    })
  }

  return { push, replace }
}
