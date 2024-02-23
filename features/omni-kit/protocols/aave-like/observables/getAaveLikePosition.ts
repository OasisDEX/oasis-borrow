import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { getAaveLikePositionData$ } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { getSparkV3Services } from 'lendingProtocols/spark-v3'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getAaveLikePosition$(
  onEveryBlock$: Observable<number>,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, protocol, proxy, quoteToken }: DpmPositionData,
  networkId: OmniSupportedNetworkIds,
): Observable<AaveLikePositionV2> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(() => {
      if (
        ![LendingProtocol.AaveV2, LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(
          protocol.toLowerCase() as LendingProtocol,
        )
      ) {
        console.warn(`Wrong dpm protocol ${protocol}`)
        return of(null)
      }

      const services = {
        [LendingProtocol.AaveV2]: getAaveV2Services({
          refresh$: onEveryBlock$,
        }),
        [LendingProtocol.AaveV3]: getAaveV3Services({
          refresh$: onEveryBlock$,
          networkId: networkId as AaveV3SupportedNetwork,
        }),
        [LendingProtocol.SparkV3]: getSparkV3Services({
          refresh$: onEveryBlock$,
          networkId: networkId as SparkV3SupportedNetwork,
        }),
      }

      return getAaveLikePositionData$({
        networkId,
        proxyAddress: proxy,
        collateralToken,
        debtToken: quoteToken,
        protocol: protocol as LendingProtocol,
        collateralPrice,
        debtPrice: quotePrice,
        services: services[protocol as AaveLikeLendingProtocol],
      })
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
