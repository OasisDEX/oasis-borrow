import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export function checkAcceptanceFromApi$(
  version: string,
  walletAddress: string,
): Observable<{ acceptance: boolean; updated?: boolean; authorized?: boolean }> {
  return ajax({
    url: `/api/tos/${version}/${walletAddress}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).pipe(
    map((resp) => {
      const { acceptance, updated, authorized } = resp.response as {
        acceptance: boolean
        updated?: boolean
        authorized?: boolean
      }

      return { acceptance, updated, authorized }
    }),
    catchError((err) => {
      if (err.xhr.status === 404) {
        return of({ acceptance: false })
      }
      throw err
    }),
  )
}

export function saveAcceptanceFromApi$(version: string, walletAddress: string): Observable<void> {
  return ajax({
    url: `/api/tos`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      docVersion: version,
      walletAddress: walletAddress.toLowerCase(),
    },
  }).pipe(map((_) => {}))
}
