import { Observable, of } from 'rxjs'
import { one } from '../../helpers/zero'
import { map, shareReplay } from 'rxjs/operators'
import { observe } from '../calls/observe'
import { getAaveOracleAssetPriceData } from '../calls/aave/aavePriceOracle'
import { Context } from '../network'
import { memoize } from 'lodash'
import { BigNumber } from 'bignumber.js'

export const createAaveOracleAssetPriceData$ = (
  refreshInterval$: Observable<any>,
  context$: Observable<Context>,
  args: { token: string },
) => {
  if (args.token === 'ETH') {
    return of(one).pipe(shareReplay(1))
  } else {
    return observe(
      refreshInterval$,
      context$,
      getAaveOracleAssetPriceData,
      ({ token }) => token,
    )(args)
  }
}

export const createConvertToAaveOracleAssetPrice$ = (
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>,
  args: { token: string; amount: BigNumber },
) => {
  return aaveOracleAssetPriceData$({ token: args.token }).pipe(
    map((price) => args.amount.times(price)),
  )
}
