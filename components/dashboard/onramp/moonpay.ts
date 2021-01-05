import { BigNumber } from 'bignumber.js'
import getConfig from 'next/config'
import { Dictionary } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map, shareReplay } from 'rxjs/operators'

import { Quote } from './onrampForm'

const {
  publicRuntimeConfig: { moonpayApiHost, prodMoonPayKey },
} = getConfig()

export function getMoonpayRates$(): Observable<Dictionary<Quote>> {
  return ajax({
    url: `https://${moonpayApiHost}/currencies/price?apiKey=${prodMoonPayKey}&cryptoCurrencies=dai,eth&fiatCurrencies=usd`,
  }).pipe(
    map((r: any) => {
      const rates: Dictionary<any> = r.response
      Object.keys(rates).forEach((key: string) => {
        rates['USD' + key] = { quote: new BigNumber(rates[key]['USD']) }
      })
      return { ...rates }
    }),
    shareReplay(1),
  )
}
