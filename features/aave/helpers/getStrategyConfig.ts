import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AaveConfigurationData } from '../../../blockchain/calls/aave/aaveLendingPool'
import { StrategyConfig } from '../common/StrategyConfigTypes'
import { strategies } from '../strategyConfig'
import { createAaveUserConfiguration, hasAssets } from './aaveUserConfiguration'

export function getStrategyConfig$(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  aaveUserConfiguration$: ({ address }: { address: string }) => Observable<AaveConfigurationData>,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
  address: string,
): Observable<StrategyConfig> {
  return proxyAddress$(address).pipe(
    switchMap((proxyAddress) => {
      return combineLatest(
        aaveUserConfiguration$({ address: proxyAddress || address }),
        aaveReservesList$(),
      )
    }),
    map(([aaveUserConfiguration, aaveReservesList]) => {
      return createAaveUserConfiguration(aaveUserConfiguration, aaveReservesList)
    }),
    map((aaveUserConfiguration) => {
      if (hasAssets(aaveUserConfiguration, 'STETH', 'ETH')) {
        return strategies['aave-earn']
      } else if (hasAssets(aaveUserConfiguration, 'ETH', 'USDC')) {
        return strategies['aave-multiply']
      } else {
        throw new Error(
          `could not resolve strategy for address ${address}. aaveUserConfiguration ${JSON.stringify(
            aaveUserConfiguration,
          )}`,
        )
      }
    }),
  )
}
