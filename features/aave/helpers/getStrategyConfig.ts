import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AaveConfigurationData } from '../../../blockchain/calls/aave/aaveLendingPool'
import { StrategyConfig } from '../common/StrategyConfigTypes'
import { strategies } from '../strategyConfig'
import { createAaveUserConfiguration, hasOtherAssets } from './aaveUserConfiguration'

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
      if (hasOtherAssets(aaveUserConfiguration, ['ETH', 'STETH'])) {
        return strategies['aave-multiply']
      } else {
        return strategies['aave-earn']
      }
    }),
  )
}
