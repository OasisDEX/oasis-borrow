import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export function checkAcceptanceFromApi$(
  token: string,
  version: string,
): Observable<{ acceptance: boolean; updated?: boolean }> {
  return ajax({
    url: `/api/tos/${version}`,
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
    url: `/api/tos`,
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
