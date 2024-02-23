import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { getOnChainPositionOmni } from 'features/omni-kit/protocols/aave/helpers'
import type { OmniSupportedNetworkIds, OmniTokensPrecision } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getAaveLikePosition$(
  onEveryBlock$: Observable<number> | undefined,
  // TODO these prices should be taken form aave oracles
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, protocol, proxy, quoteToken }: DpmPositionData,
  networkId: OmniSupportedNetworkIds,
  tokensPrecision: OmniTokensPrecision,
): Observable<AaveLikePositionV2> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      if (
        ![LendingProtocol.AaveV2, LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(
          protocol.toLowerCase() as LendingProtocol,
        )
      ) {
        console.warn(`Wrong dpm protocol ${protocol}`)
        return null
      }

      return await getOnChainPositionOmni({
        networkId,
        proxyAddress: proxy,
        collateralToken,
        debtToken: quoteToken,
        protocol: protocol as LendingProtocol,
        collateralPrice,
        debtPrice: quotePrice,
      })
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
