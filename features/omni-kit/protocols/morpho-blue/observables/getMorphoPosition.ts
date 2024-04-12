import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider } from 'blockchain/networks'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { getMorphoCumulatives } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds, OmniTokensPrecision } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getMorphoPosition$(
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, protocol, proxy, quoteToken }: DpmPositionData,
  pairId: number,
  networkId: OmniSupportedNetworkIds,
  tokensPrecision: OmniTokensPrecision,
): Observable<MorphoBluePosition> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      const marketId = morphoMarkets[networkId]?.[`${collateralToken}-${quoteToken}`][pairId - 1]

      if (protocol.toLowerCase() !== LendingProtocol.MorphoBlue || !marketId) return null

      return await views.morpho.getPosition(
        {
          collateralPrecision: tokensPrecision?.collateralPrecision ?? DEFAULT_TOKEN_DIGITS,
          collateralPriceUSD: collateralPrice,
          marketId,
          proxyAddress: proxy,
          quotePrecision: tokensPrecision?.quotePrecision ?? DEFAULT_TOKEN_DIGITS,
          quotePriceUSD: quotePrice,
        },
        {
          getCumulatives: getMorphoCumulatives(networkId),
          morphoAddress: getNetworkContracts(networkId).morphoBlue.address,
          provider: getRpcProvider(networkId),
        },
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
