import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { AaveConfigurationData } from '../../../blockchain/calls/aave/aaveLendingPool'
import { IStrategyConfig } from '../common/StrategyConfigTypes'
import { loadStrategyFromTokens } from '../strategyConfig'
import { PositionId } from '../types'
import { createAaveUserConfiguration, hasAssets } from './aaveUserConfiguration'
import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  aaveUserConfiguration$: ({ address }: { address: string }) => Observable<AaveConfigurationData>,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
  positionId: PositionId,
): Observable<IStrategyConfig> {
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
        return loadStrategyFromTokens('STETH', 'ETH')
      } else if (hasAssets(aaveUserConfiguration, 'ETH', 'USDC')) {
        return loadStrategyFromTokens('ETH', 'USDC')
      } else {
        throw new Error(
          `could not resolve strategy position ID ${positionId}. aaveUserConfiguration ${JSON.stringify(
            aaveUserConfiguration,
          )}`,
        )
      }
    }),
    distinctUntilChanged(isEqual),
  )
}
