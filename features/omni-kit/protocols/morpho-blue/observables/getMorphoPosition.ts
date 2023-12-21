import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/config'
import { getMorphoCumulatives } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { MorphoSupportedNetworksIds } from 'features/omni-kit/protocols/morpho-blue/types'
import type { OmniTokensPrecision } from 'features/omni-kit/types'
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
  networkId: NetworkIds,
  tokensPrecision?: OmniTokensPrecision,
): Observable<MorphoBluePosition> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      if (protocol.toLowerCase() !== LendingProtocol.MorphoBlue) return null

      return await views.morpho.getPosition(
        {
          collateralPrecision: tokensPrecision?.collateralPrecision ?? DEFAULT_TOKEN_DIGITS,
          collateralPriceUSD: collateralPrice,
          marketId: morphoMarkets[`${collateralToken}-${quoteToken}` as keyof typeof morphoMarkets],
          proxyAddress: proxy,
          quotePrecision: tokensPrecision?.quotePrecision ?? DEFAULT_TOKEN_DIGITS,
          quotePriceUSD: quotePrice,
        },
        {
          getCumulatives: getMorphoCumulatives(),
          morphoAddress: getNetworkContracts(networkId as MorphoSupportedNetworksIds).morphoBlue
            .address,
          provider: getRpcProvider(networkId),
        },
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
