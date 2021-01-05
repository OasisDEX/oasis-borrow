import { BigNumber } from 'bignumber.js'
import getConfig from 'next/config'
import { Dictionary } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map, shareReplay } from 'rxjs/operators'

import { Quote } from './onrampForm'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

export function getLatamexRates$(): Observable<Dictionary<Quote>> {
  return ajax({
    url: `${apiHost}/api/latamex_quotes`,
  }).pipe(
    map((r: any) => {
      const quotes: Dictionary<any> = r.response
      Object.keys(quotes).forEach((pair: string) => {
        quotes[pair] = {
          quote: new BigNumber(quotes[pair].quote),
          fee: new BigNumber(quotes[pair].fee),
          minCryptoAmount: new BigNumber(quotes[pair].fromAssetMinAmount || 0),
          minFiatAmount: new BigNumber(quotes[pair].toAssetMinAmount || 0),
        }
      })
      return quotes
    }),
    shareReplay(1),
  )
}
