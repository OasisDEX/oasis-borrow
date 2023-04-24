import { BigNumber } from 'bignumber.js'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface AaveV3OracleAssertPriceArgs {
  token: string
}

export function createConvertToAaveV3OracleAssetPrice$(
  aaveOracleAssetPriceData$: (args: { token: string }) => Observable<BigNumber>,
  args: { token: string; amount: BigNumber },
) {
  return aaveOracleAssetPriceData$({ token: args.token }).pipe(
    map((price) => args.amount.times(price)),
  )
}
