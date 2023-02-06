import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { loadStrategyFromTokens } from 'features/aave/strategyConfig'
import { PositionId } from 'features/aave/types'
import { AaveUserConfigurationResults } from 'lendingProtocols/aave-v2/pipelines'
import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  aaveUserConfiguration$: (proxyAddress: string) => Observable<AaveUserConfigurationResults>,
  lastCreatedPositionForProxy$: (proxyAddress: string) => Observable<PositionCreated>,
  positionId: PositionId,
): Observable<IStrategyConfig | undefined> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dsProxy, dpmProxy }) => {
      const effectiveProxyAddress = dsProxy || dpmProxy?.proxy
      return combineLatest(
        iif(
          () => effectiveProxyAddress !== undefined,
          aaveUserConfiguration$(effectiveProxyAddress!),
          of(undefined),
        ),
        effectiveProxyAddress && effectiveProxyAddress === dpmProxy?.proxy
          ? lastCreatedPositionForProxy$(effectiveProxyAddress)
          : of(undefined),
      )
    }),
    map(([aaveUserConfigurations, lastCreatedPosition]) => {
      if (aaveUserConfigurations === undefined) {
        return undefined
      }

      switch (true) {
        case aaveUserConfigurations.hasAssets('STETH', 'ETH'):
          return loadStrategyFromTokens('STETH', 'ETH')
        case aaveUserConfigurations.hasAssets('ETH', 'USDC'):
          return loadStrategyFromTokens('ETH', 'USDC')
        case aaveUserConfigurations.hasAssets('WBTC', 'USDC'):
          return loadStrategyFromTokens('WBTC', 'USDC')
        case aaveUserConfigurations.hasAssets('STETH', 'USDC'):
          return loadStrategyFromTokens('STETH', 'USDC')
        default:
          if (lastCreatedPosition !== undefined) {
            return loadStrategyFromTokens(
              lastCreatedPosition.collateralTokenSymbol,
              lastCreatedPosition.debtTokenSymbol,
            )
          }
          return undefined
      }
    }),
    distinctUntilChanged(isEqual),
  )
}
