import type { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getNetworkByName, networksByName } from 'blockchain/networks'
import { getUserDpmProxy } from 'blockchain/userDpmProxies'
import { loadStrategyFromTokens } from 'features/aave'
import { aaveLikeProtocols } from 'features/aave/constants'
import type { PositionCreated } from 'features/aave/services'
import {
  getPositionCreatedEventForProxyAddress,
  mapCreatedPositionEventToPositionCreated,
} from 'features/aave/services'
import type { IStrategyConfig, PositionId } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { productToVaultType } from 'helpers/productToVaultType'
import { LendingProtocol } from 'lendingProtocols'
import type { AaveUserConfigurationResults } from 'lendingProtocols/aave-v2/pipelines'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import type { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (
    positionId: PositionId,
    networkId: NetworkIds,
  ) => Observable<ProxiesRelatedWithPosition>,
  aaveUserConfiguration$: (proxyAddress: string) => Observable<AaveUserConfigurationResults>,
  readPositionCreatedEvents$: (
    walletAddress: string,
    networkId: NetworkIds,
  ) => Observable<PositionCreated[]>,
  positionId: PositionId,
  networkName: NetworkNames,
  vaultType: VaultType,
): Observable<IStrategyConfig> {
  const networkConfig = getNetworkByName(networkName)

  return proxiesForPosition$(positionId, networkConfig.id).pipe(
    switchMap(({ dsProxy, dpmProxy }) => {
      const effectiveProxyAddress = dsProxy || dpmProxy?.proxy
      return combineLatest(
        iif(
          () => effectiveProxyAddress !== undefined,
          aaveUserConfiguration$(effectiveProxyAddress!),
          of(undefined),
        ),
        effectiveProxyAddress && effectiveProxyAddress === dpmProxy?.proxy && dpmProxy.user
          ? readPositionCreatedEvents$(dpmProxy.user, networkConfig.id)
          : of(undefined),
      )
    }),
    map(([aaveUserConfigurations, positions]) => {
      const filteredPositions = positions?.filter((position) =>
        aaveLikeProtocols.includes(position.protocol),
      )

      const lastCreatedPosition = filteredPositions?.pop()
      const vaultTypeIsUnknown = vaultType === VaultType.Unknown
      // event has a higher priority than assets
      if (lastCreatedPosition !== undefined) {
        const _vaultType = vaultTypeIsUnknown
          ? productToVaultType(lastCreatedPosition.positionType)
          : vaultType

        return loadStrategyFromTokens(
          lastCreatedPosition.collateralTokenSymbol,
          lastCreatedPosition.debtTokenSymbol,
          networkName,
          lastCreatedPosition.protocol,
          _vaultType || VaultType.Borrow,
        )
      }
      if (aaveUserConfigurations === undefined) {
        throw new Error(`There is no PositionCreatedEvent and AaveUserConfiguration`)
      }

      switch (true) {
        // For aave v3 we should have the event. and we don't support changing vault type in aave v2
        case aaveUserConfigurations.hasAssets(['STETH'], ['ETH', 'WETH']):
          return loadStrategyFromTokens(
            'STETH',
            'ETH',
            networkName,
            LendingProtocol.AaveV2,
            VaultType.Earn,
          )
        case aaveUserConfigurations.hasAssets(['ETH', 'WETH'], ['USDC']):
          return loadStrategyFromTokens(
            'ETH',
            'USDC',
            networkName,
            LendingProtocol.AaveV2,
            VaultType.Multiply,
          )
        case aaveUserConfigurations.hasAssets(['WBTC'], ['USDC']):
          return loadStrategyFromTokens(
            'WBTC',
            'USDC',
            networkName,
            LendingProtocol.AaveV2,
            VaultType.Multiply,
          )
        case aaveUserConfigurations.hasAssets(['STETH'], ['USDC']):
          return loadStrategyFromTokens(
            'STETH',
            'USDC',
            networkName,
            LendingProtocol.AaveV2,
            VaultType.Multiply,
          )
        default:
          throw new Error(`User doesn't have assets supported in the app`)
      }
    }),
    distinctUntilChanged(isEqual),
  )
}

export async function getAaveV3StrategyConfig(
  positionId: PositionId,
  networkName: NetworkNames,
  vaultType?: VaultType,
): Promise<IStrategyConfig> {
  const { vaultId } = positionId

  const networkId = networksByName[networkName].id

  if (vaultId === undefined) {
    throw new Error(`Can't load strategy config for position without vaultId. VaultId: ${vaultId}`)
  }

  const dpmProxy = await getUserDpmProxy(vaultId, networkId)
  if (!dpmProxy) {
    throw new Error(`Can't load strategy config for position without dpmProxy. VaultId: ${vaultId}`)
  }
  const createdPositions = await getPositionCreatedEventForProxyAddress(networkId, dpmProxy.proxy)

  const lastCreatedPosition = createdPositions
    .map((event) => mapCreatedPositionEventToPositionCreated(event, networkId))
    .filter((position) => aaveLikeProtocols.includes(position.protocol))
    .pop()

  if (!lastCreatedPosition) {
    throw new Error(`Can't load strategy config for position without dpmProxy. VaultId: ${vaultId}`)
  }

  const _vaultType =
    vaultType === undefined || vaultType === VaultType.Unknown
      ? productToVaultType(lastCreatedPosition.positionType)
      : vaultType

  return loadStrategyFromTokens(
    lastCreatedPosition.collateralTokenSymbol,
    lastCreatedPosition.debtTokenSymbol,
    networkName,
    lastCreatedPosition.protocol,
    _vaultType,
  )
}
