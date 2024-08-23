import type { MakerPosition } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { makerMarkets } from 'features/omni-kit/protocols/maker/settings'
import type { OmniSupportedNetworkIds, OmniTokensPrecision } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export const getMakerPositionFromSubgraph =
  ({ cdpId, ilkId }: { cdpId: string; ilkId: string }) =>
  async () => {
    const subgraphPosition = (await loadSubgraph({
      subgraph: 'Discover',
      method: 'getMakerPosition',
      networkId: NetworkIds.MAINNET,
      params: {
        cdpId,
        ilkId,
      },
    })) as SubgraphsResponses['Discover']['getMakerPosition']

    return {
      ...subgraphPosition.response.cdps[0],
      ilk: subgraphPosition.response.collateralTypes[0],
    }
  }

export function getMakerPosition$(
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  osmCurrentCollateralPriceUSD: BigNumber,
  osmNextCollateralPriceUSD: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, protocol, proxy, quoteToken, vaultId }: DpmPositionData,
  pairId: number,
  networkId: OmniSupportedNetworkIds,
  tokensPrecision: OmniTokensPrecision,
): Observable<MakerPosition> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      const marketId = makerMarkets[networkId]?.[`${collateralToken}-${quoteToken}`]?.[pairId - 1]

      if (protocol.toLowerCase() !== LendingProtocol.Maker || !marketId) return null

      return await views.maker.getPosition(
        {
          collateralPrecision: tokensPrecision?.collateralPrecision ?? DEFAULT_TOKEN_DIGITS,
          marketCollateralPriceUSD: collateralPrice,
          osmCurrentCollateralPriceUSD,
          osmNextCollateralPriceUSD,
          marketId,
          proxyAddress: proxy,
          quotePrecision: tokensPrecision?.quotePrecision ?? DEFAULT_TOKEN_DIGITS,
          quotePriceUSD: quotePrice,
        },
        {
          getPosition: getMakerPositionFromSubgraph({ cdpId: vaultId, ilkId: marketId }),
        },
        // {
        //   getCumulatives: getMakerCumulatives(networkId),
        //   morphoAddress: getNetworkContracts(networkId).morphoBlue.address,
        //   provider: getRpcProvider(networkId),
        // },
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
