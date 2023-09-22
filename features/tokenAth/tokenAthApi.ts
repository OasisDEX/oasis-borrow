import BigNumber from 'bignumber.js'
import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface TokenAthResponse {
  ath?: BigNumber
  error?: string
}

export function getTokenAth$(coinGeckoId: string): Observable<TokenAthResponse> {
  return ajax({
    url: `https://api.coingecko.com/api/v3/coins/${coinGeckoId}?tickers=false&market_data=true&community_data=false&developer_data=false`,
    method: 'GET',
  }).pipe(
    map(({ response }) => ({ ath: new BigNumber(response.market_data.ath.usd) })),
    catchError((response) => of({ error: response.error })),
  )
}
