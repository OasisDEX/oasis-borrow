import { BigNumber } from 'bignumber.js'
import getConfig from 'next/config'
import { Dictionary } from 'ramda'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map, shareReplay } from 'rxjs/operators'

const {
  publicRuntimeConfig: { compoundApiHost },
} = getConfig()

export function getCompoundApy$(): Observable<BigNumber | undefined> {
  return ajax({
    url: `https://${compoundApiHost}/api/v2/ctoken`,
  }).pipe(
    map((r: any) => {
      const response: Dictionary<any> = r.response

      if (response.cToken) {
        const [cDai] = response.cToken.filter((ct: any) => ct.underlying_symbol === 'DAI')
        return cDai ? new BigNumber(cDai.comp_supply_apy.value) : undefined
      }

      return undefined
    }),
    shareReplay(1),
  )
}
