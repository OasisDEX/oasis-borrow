import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export function checkAcceptanceFromApi$(
  token: string,
  version: string,
): Observable<{ acceptance: boolean; updated?: boolean }> {
  return ajax({
    url: `${basePath}/api/tos/${version}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
  }).pipe(
    map((resp) => {
      const { acceptance, updated } = resp.response as { acceptance: boolean; updated?: boolean }

      return { acceptance, updated }
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of({ acceptance: false })
      }
      throw err
    }),
  )
}

export function saveAcceptanceFromApi$(
  token: string,
  version: string,
  email?: string,
): Observable<void> {
  return ajax({
    url: `${basePath}/api/tos`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      docVersion: version,
      email,
    },
  }).pipe(map((_) => {}))
}
