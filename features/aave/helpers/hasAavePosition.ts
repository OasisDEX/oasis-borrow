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
    map((accountData) => {
      // cheap hack to determine if the user has the relevant aave position here
      // todo: check collateral/debt for current address against strategy token config to determine if this account already has a position here
      // probably will need to look at all DPM accounts for the current wallet and check against those
      const currentlyOnAavePage = location && location.href.includes('stETHeth')
      return currentlyOnAavePage && accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL)
    }),
    startWith(false),
  )
}
