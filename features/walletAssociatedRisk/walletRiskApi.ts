import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface WalletRiskResponse {
  isRisky?: boolean
  error?: string
}

export function getWalletRisk$(
  chainId: number,
  walletAddress: string,
): Observable<WalletRiskResponse> {
  return ajax({
    url: `/api/risk`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { chainId, walletAddress },
  }).pipe(
    map(({ response }) => response as WalletRiskResponse),
    catchError((error) => {
      return of({ error: error.xhr.response.error })
    }),
  )
}
