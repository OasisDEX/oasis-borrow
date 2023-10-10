import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface WalletRiskResponse {
  isRisky?: boolean
  error?: string
}

export function getWalletRisk$(token: string, chainId: number): Observable<WalletRiskResponse> {
  return ajax({
    url: `/api/risk`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: { chainId },
  }).pipe(
    map(({ response }) => response as WalletRiskResponse),
    catchError((error) => {
      return of({ error: error.xhr.response.error })
    }),
  )
}
