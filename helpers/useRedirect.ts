import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'

// getting query params which should be persisted across page transitions
// url can already have some query params so we have to set initial prefix
// ommiting redirectUrl and address so it is not persisted
export function getQueryParams(query: ParsedUrlQuery, url?: string) {
  const initialPrefix = url && url.includes('?') ? '&' : '?'
  let queryParams = initialPrefix

  Object.entries(query).forEach(([key, value]) => {
    // connect route is used for catching all app routes without address and it gets appended to query object
    if (key !== 'connect' && key !== 'address' && !url?.includes(key)) {
      const prefix = queryParams.length === 1 ? '' : '&'
      queryParams += `${prefix}${key}=${value}`
    }
  })

  return queryParams === initialPrefix ? '' : queryParams
}

export function useRedirect() {
  const router = useRouter()

  function push(url: string, as?: string) {
    const queryParams = getQueryParams(router.query, url)
    /* eslint-disable-next-line */
    router.push(`${url}${queryParams}`, `${as || url}${queryParams}`)
  }

  function replace(url: string, as?: string) {
    const queryParams = getQueryParams(router.query, url)
    /* eslint-disable-next-line */
    router.replace(`${url}${queryParams}`, `${as || url}${queryParams}`)
  }

  return { push, replace }
}
