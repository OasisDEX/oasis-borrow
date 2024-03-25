import type { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { AaveContext } from 'features/aave/aave-context'
import { loadStrategyFromTokens } from 'features/aave/strategies'
import type { ManageViewInfo, PositionId } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { GetApiVault } from 'features/shared/vaultApi'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import type { AssetForMigration } from './getAssetsForMigration'

export function getManageViewInfo(
  deps: {
    strategyConfig$: AaveContext['strategyConfig$']
    proxiesRelatedWithPosition$: AaveContext['proxiesRelatedWithPosition$']
    getApiVault: GetApiVault
    networkName: NetworkNames
    chainId: NetworkIds
    lendingProtocol: AaveLikeLendingProtocol
  },
  args: { positionId: PositionId },
): Observable<ManageViewInfo> {
  const {
    strategyConfig$,
    getApiVault,
    lendingProtocol,
    proxiesRelatedWithPosition$,
    chainId,
    networkName,
  } = deps
  return proxiesRelatedWithPosition$(args.positionId, deps.chainId).pipe(
    switchMap(async (proxiesRelatedWithPosition) => {
      if (args.positionId.external) {
        return { proxies: proxiesRelatedWithPosition, apiVault: undefined }
      }
      const apiVault = await getApiVault({
        vaultId: parseInt(proxiesRelatedWithPosition?.dpmProxy?.vaultId ?? '0'),
        protocol: lendingProtocol,
        chainId: chainId,
        tokenPair: '',
        owner: proxiesRelatedWithPosition.walletAddress,
      })
      return { proxies: proxiesRelatedWithPosition, apiVault: apiVault }
    }),
    switchMap(({ proxies, apiVault }) => {
      return strategyConfig$(
        args.positionId,
        networkName,
        apiVault?.type ?? VaultType.Unknown,
        lendingProtocol,
      ).pipe(
        map((strategyConfig): ManageViewInfo => {
          return {
            positionId: args.positionId,
            networkName: networkName,
            vaultType: apiVault?.type ?? VaultType.Unknown,
            protocol: lendingProtocol,
            strategyConfig: strategyConfig,
            proxiesRelatedWithPosition: proxies,
          }
        }),
      )
    }),
  )
}

export function getManageViewInfoExternal(
  deps: {
    strategyConfig$: AaveContext['strategyConfig$']
    proxiesRelatedWithPosition$: AaveContext['proxiesRelatedWithPosition$']
    getApiVault: GetApiVault
    networkName: NetworkNames
    chainId: NetworkIds
    lendingProtocol: AaveLikeLendingProtocol
    getExternalTokens: (args: {
      positionId: Required<Pick<PositionId, 'positionAddress'>>
    }) => Promise<AssetForMigration | undefined>
  },
  args: { positionId: Required<Pick<PositionId, 'positionAddress'>> },
): Observable<ManageViewInfo> {
  const { lendingProtocol, networkName, getExternalTokens } = deps
  return from(getExternalTokens({ positionId: args.positionId })).pipe(
    map((assetForMigration) => {
      if (assetForMigration === undefined) {
        throw new Error('Cannot obtain position information, there is no migration data.')
      }
      const strategy = loadStrategyFromTokens(
        assetForMigration?.collateral ?? '',
        assetForMigration?.debt ?? '',
        networkName,
        lendingProtocol,
        VaultType.Borrow,
      )

      return {
        positionId: {
          positionAddress: args.positionId.positionAddress,
          walletAddress: assetForMigration.walletAddress,
          external: true,
          positionAddressType: assetForMigration.positionAddressType,
          vaultId: undefined,
        },
        networkName: networkName,
        vaultType: VaultType.Borrow,
        protocol: lendingProtocol,
        strategyConfig: strategy,
        proxiesRelatedWithPosition: {
          dsProxy:
            assetForMigration.positionAddressType === 'DS_PROXY'
              ? assetForMigration.positionAddress
              : undefined,
          dpmProxy: undefined,
          walletAddress: assetForMigration.walletAddress,
        },
      }
    }),
  )
}
