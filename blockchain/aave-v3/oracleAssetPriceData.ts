import { BigNumber } from 'bignumber.js'
import { Observable, of } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { one } from '../../helpers/zero'
import { observe } from '../calls/observe'
import { Context } from '../network'
import { getAaveV3OracleAssetPriceData$ } from './aaveV3Oracle'

export interface AaveV3OracleAssertPriceArgs {
  token: string
}

export function createAaveV3OracleAssetPriceData$(
  refreshInterval$: Observable<any>,
  context$: Observable<Context>,
  args: AaveV3OracleAssertPriceArgs,
) {
  if (args.token === 'ETH') {
    return of(one).pipe(shareReplay(1))
  } else {
    return observe(
      refreshInterval$,
      context$,
      getAaveV3OracleAssetPriceData$,
      ({ token }) => token,
    )(args)
  }
}

export function createConvertToAaveV3OracleAssetPrice$(
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>,
  args: { token: string; amount: BigNumber },
) {
  return aaveOracleAssetPriceData$({ token: args.token }).pipe(
    map((price) => args.amount.times(price)),
  )
}
