import { NetworkNames } from 'blockchain/networks'
import { loadStrategyFromTokens } from 'features/aave'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { AaveUserConfigurationResults } from 'lendingProtocols/aave-v2/pipelines'
import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  aaveUserConfiguration$: (proxyAddress: string) => Observable<AaveUserConfigurationResults>,
  lastCreatedPositionForProxy$: (proxyAddress: string) => Observable<PositionCreated | undefined>,
  positionId: PositionId,
  networkName: NetworkNames,
): Observable<IStrategyConfig> {
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
      // event has a higher priority than assets
      if (lastCreatedPosition !== undefined) {
        return loadStrategyFromTokens(
          lastCreatedPosition.collateralTokenSymbol,
          lastCreatedPosition.debtTokenSymbol,
          networkName,
        )
      }
      if (aaveUserConfigurations === undefined) {
        throw new Error(`There is no PositionCreatedEvent and AaveUserConfiguration`)
      }

      switch (true) {
        case aaveUserConfigurations.hasAssets(['STETH'], ['ETH', 'WETH']):
          return loadStrategyFromTokens('STETH', 'ETH', networkName)
        case aaveUserConfigurations.hasAssets(['ETH', 'WETH'], ['USDC']):
          return loadStrategyFromTokens('ETH', 'USDC', networkName)
        case aaveUserConfigurations.hasAssets(['WBTC'], ['USDC']):
          return loadStrategyFromTokens('WBTC', 'USDC', networkName)
        case aaveUserConfigurations.hasAssets(['STETH'], ['USDC']):
          return loadStrategyFromTokens('STETH', 'USDC', networkName)
        default:
          throw new Error(`User doesn't have assets supported in the app`)
      }
    }),
    distinctUntilChanged(isEqual),
  )
}
