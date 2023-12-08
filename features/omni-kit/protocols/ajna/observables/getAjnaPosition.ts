import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  getAjnaCumulatives,
  getAjnaEarnData,
  getAjnaPoolAddress,
  getAjnaPoolData,
  isAjnaSupportedNetwork,
} from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getAjnaPosition$(
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, product, protocol, proxy, quoteToken }: DpmPositionData,
  networkId: NetworkIds,
  collateralAddress?: string,
  quoteAddress?: string,
): Observable<AjnaGenericPosition> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      if (protocol.toLowerCase() !== LendingProtocol.Ajna) return null

      if (!isAjnaSupportedNetwork(networkId)) {
        throw new Error(`Ajna doesn't support this network: ${networkId}`)
      }

      const { ajnaPoolPairs, ajnaPoolInfo } = getNetworkContracts(networkId)

      const commonPayload = {
        collateralPrice,
        quotePrice,
        proxyAddress: proxy,
        poolAddress:
          collateralAddress && quoteAddress
            ? await getAjnaPoolAddress(collateralAddress, quoteAddress, networkId)
            : ajnaPoolPairs[`${collateralToken}-${quoteToken}` as keyof typeof ajnaPoolPairs]
                .address,
      }

      const commonDependency = {
        poolInfoAddress: ajnaPoolInfo.address,
        provider: getRpcProvider(networkId),
        getPoolData: getAjnaPoolData(networkId),
        getCumulatives: getAjnaCumulatives(networkId),
      }

      switch (product as OmniProductType) {
        case OmniProductType.Borrow:
        case OmniProductType.Multiply:
          return await views.ajna.getPosition(commonPayload, commonDependency)
        case OmniProductType.Earn:
          return await views.ajna.getEarnPosition(commonPayload, {
            ...commonDependency,
            getEarnData: getAjnaEarnData(networkId),
          })
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
