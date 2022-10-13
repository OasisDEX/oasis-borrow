import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  MINIMAL_COLLATERAL,
} from 'blockchain/calls/aave/aaveLendingPool'
import { Observable } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

export function hasAavePosition$(
  getProxyAddress$: (address: string) => Observable<string | undefined>,
  getAaveUserAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  address: string,
): Observable<boolean> {
  return getProxyAddress$(address).pipe(
    filter((proxyAddress) => proxyAddress !== undefined),
    switchMap((proxyAddress) => getAaveUserAccountData$({ proxyAddress: proxyAddress! })),
    map((accountData) => accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL)),
    startWith(false),
  )
}
