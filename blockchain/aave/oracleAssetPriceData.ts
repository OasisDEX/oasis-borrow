import { BigNumber } from 'bignumber.js'
import { Observable, of } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { one } from '../../helpers/zero'
import { getAaveV2OracleAssetPriceData } from '../calls/aave/aaveV2PriceOracle'
import { observe } from '../calls/observe'
import { Context } from '../network'

export interface AaveOracleAssertPriceArgs {
  token: string
}

export function createAaveOracleAssetPriceData$(
  refreshInterval$: Observable<any>,
  context$: Observable<Context>,
  args: AaveOracleAssertPriceArgs,
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

export function createConvertToAaveOracleAssetPrice$(
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>,
  args: { token: string; amount: BigNumber },
) {
  return aaveOracleAssetPriceData$({ token: args.token }).pipe(
    map((price) => args.amount.times(price)),
  )
}
