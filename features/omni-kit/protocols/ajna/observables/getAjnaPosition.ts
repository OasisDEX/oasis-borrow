import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  getAjnaCumulatives,
  getAjnaEarnData,
  getAjnaPoolAddress,
  getAjnaPoolData,
} from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getAjnaPosition$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { collateralToken, product, protocol, proxy, quoteToken }: DpmPositionData,
  collateralAddress?: string,
  quoteAddress?: string,
): Observable<AjnaGenericPosition> {
  return combineLatest(
    context$,
    iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined)),
  ).pipe(
    switchMap(async ([context]) => {
      if (protocol.toLowerCase() !== LendingProtocol.Ajna) return null
      const { ajnaPoolPairs, ajnaPoolInfo } = getNetworkContracts(
        NetworkIds.MAINNET,
        context.chainId,
      )

      const commonPayload = {
        collateralPrice,
        quotePrice,
        proxyAddress: proxy,
        poolAddress:
          collateralAddress && quoteAddress
            ? await getAjnaPoolAddress(collateralAddress, quoteAddress, context.chainId)
            : ajnaPoolPairs[`${collateralToken}-${quoteToken}` as keyof typeof ajnaPoolPairs]
                .address,
      }

      const commonDependency = {
        poolInfoAddress: ajnaPoolInfo.address,
        provider: getRpcProvider(context.chainId),
        getPoolData: getAjnaPoolData(context.chainId),
        getCumulatives: getAjnaCumulatives(context.chainId),
      }

      switch (product as OmniProductType) {
        case OmniProductType.Borrow:
        case OmniProductType.Multiply:
          return await views.ajna.getPosition(commonPayload, commonDependency)
        case OmniProductType.Earn:
          return await views.ajna.getEarnPosition(commonPayload, {
            ...commonDependency,
            getEarnData: getAjnaEarnData(context.chainId),
          })
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
