import { BigNumber } from 'bignumber.js'
import { observe } from 'blockchain/calls/observe'
import { Context } from 'blockchain/network'
import { one } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { getAaveV2OracleAssetPriceData } from './index'

export interface AaveV2OracleAssertPriceArgs {
  token: string
}

export function createAaveV2OracleAssetPriceData$(
  refreshInterval$: Observable<any>,
  context$: Observable<Context>,
  args: AaveV2OracleAssertPriceArgs,
) {
  if (args.token === 'ETH') {
    return of(one).pipe(shareReplay(1))
  } else {
    return observe(
      refreshInterval$,
      context$,
      getAaveV2OracleAssetPriceData,
      ({ token }) => token,
    )(args)
  }
}

export function createConvertToAaveV2OracleAssetPrice$(
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>,
  args: { token: string; amount: BigNumber },
) {
  return aaveOracleAssetPriceData$({ token: args.token }).pipe(
    map((price) => args.amount.times(price)),
  )
}
