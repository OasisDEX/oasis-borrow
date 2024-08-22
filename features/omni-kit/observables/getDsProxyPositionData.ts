import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables/getDpmPositionData'
import { getMakerPositionFromSubgraph } from 'features/omni-kit/protocols/maker/observables'
import type { OmniProductType } from 'features/omni-kit/types'
import { getApiVault } from 'features/shared/vaultApi'
import { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

export const getDsProxyPositionData$ = ({
  collateralToken,
  quoteToken,
  cdpId,
}: {
  collateralToken: string
  quoteToken: string
  cdpId: string
}): Observable<DpmPositionData> => {
  const tokens = getNetworkContracts(NetworkIds.MAINNET).tokens

  return from(getMakerPositionFromSubgraph({ cdpId })()).pipe(
    switchMap(({ type, creator, owner }) =>
      from(
        getApiVault({
          vaultId: Number(cdpId),
          owner: owner.id,
          protocol: LendingProtocol.Maker,
          chainId: NetworkIds.MAINNET,
          tokenPair: `${collateralToken}-${quoteToken}`,
        }),
      ).pipe(
        map((apiVault) => ({
          collateralToken,
          collateralTokenAddress: tokens[collateralToken].address,
          quoteToken,
          quoteTokenAddress: tokens[quoteToken].address,
          hasMultiplePositions: true,
          product: apiVault ? apiVault.type : (type.toLowerCase() as OmniProductType),
          protocol: LendingProtocol.Maker,
          proxy: creator,
          user: owner.id,
          vaultId: cdpId,
        })),
      ),
    ),
  )
}
