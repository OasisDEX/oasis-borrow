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
  marketId,
}: {
  collateralToken: string
  quoteToken: string
  cdpId: string
  marketId?: string
}): Observable<DpmPositionData> => {
  const tokens = getNetworkContracts(NetworkIds.MAINNET).tokens

  if (!marketId) {
    throw new Error('Market id not defined getDsProxyPositionData$')
  }

  return from(getMakerPositionFromSubgraph({ cdpId, ilkId: marketId })()).pipe(
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
