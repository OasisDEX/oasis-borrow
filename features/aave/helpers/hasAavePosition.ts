import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  MINIMAL_COLLATERAL,
} from 'blockchain/calls/aave/aaveLendingPool'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function hasAavePosition$(
  getAaveUserAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  proxyAddress: string,
): Observable<boolean> {
  return getAaveUserAccountData$({ address: proxyAddress }).pipe(
    map((accountData) => {
      return accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL)
    }),
  )
}
