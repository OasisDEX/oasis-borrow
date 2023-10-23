import type { MorphoPosition } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import { getRpcProvider } from 'blockchain/networks'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import type { OmniProduct } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getMorphoPosition$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number> | undefined,
  collateralPrice: BigNumber,
  quotePrice: BigNumber,
  { product, protocol, proxy }: DpmPositionData,
): Observable<MorphoPosition> {
  return combineLatest(
    context$,
    iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined)),
  ).pipe(
    switchMap(async ([context]) => {
      if (protocol.toLowerCase() !== LendingProtocol.MorphoBlue) return null
      const commonPayload = {
        collateralPrice,
        quotePrice,
        proxyAddress: proxy,
      }

      const commonDependency = {
        provider: getRpcProvider(context.chainId),
        getCumulatives: () => ({
          borrowCumulativeDepositUSD: new BigNumber(200),
          borrowCumulativeFeesUSD: new BigNumber(5),
          borrowCumulativeWithdrawUSD: new BigNumber(0),
        }),
      }

      switch (product as OmniProduct) {
        case 'borrow':
        case 'multiply':
          return await views.morpho.getPosition(commonPayload, commonDependency)
        case 'earn':
          return null
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
