import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { AaveConfigurationData } from '../../../blockchain/calls/aave/aaveLendingPool'
import { StrategyConfig } from '../common/StrategyConfigTypes'
import { strategies } from '../strategyConfig'
import { PositionId } from '../types'
import { createAaveUserConfiguration, hasAssets } from './aaveUserConfiguration'
import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  aaveUserConfiguration$: ({ address }: { address: string }) => Observable<AaveConfigurationData>,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
  positionId: PositionId,
): Observable<StrategyConfig> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dsProxy, dpmProxy }) => {
      const effectiveProxyAddress = dsProxy || dpmProxy?.proxy
      return combineLatest(
        iif(
          () => effectiveProxyAddress !== undefined,
          aaveUserConfiguration$({ address: effectiveProxyAddress! }),
          of([]),
        ),
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
        return strategies['aave-earn']
        // throw new Error(
        //   `could not resolve strategy for address ${address}. aaveUserConfiguration ${JSON.stringify(
        //     aaveUserConfiguration,
        //   )}`,
        // )
      }
    }),
    distinctUntilChanged(isEqual),
  )
}
