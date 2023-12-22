import type { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { AaveContext } from 'features/aave/aave-context'
import type { ManageViewInfo, PositionId } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { GetApiVault } from 'features/shared/vaultApi'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

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
