import getConfig from 'next/config'
import { of } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

export interface WalletRiskResponse {
  isRisky?: boolean
  error?: string
}

export function getWalletRisk$(token: string, isGnosis: boolean): Observable<WalletRiskResponse> {
  return ajax({
    url: `${basePath}/api/risk`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: {
      isGnosis,
    },
  }).pipe(
    map(({ response }) => response as WalletRiskResponse),
    catchError((error) => {
      return of({ error })
    }),
  )
}
