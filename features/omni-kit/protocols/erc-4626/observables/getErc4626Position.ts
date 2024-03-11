import type { Erc4626Position } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getErc4626Position$(
  onEveryBlock$: Observable<number> | undefined,
  quotePrice: BigNumber,
  vaultAddress: string,
  { proxy, user }: DpmPositionData,
  networkId: OmniSupportedNetworkIds,
): Observable<Erc4626Position> {
  return combineLatest(iif(() => onEveryBlock$ !== undefined, onEveryBlock$, of(undefined))).pipe(
    switchMap(async () => {
      return await views.common.getErc4626Position(
        {
          proxyAddress: proxy,
          quotePrice,
          user,
          vaultAddress,
        },
        {
          provider: getRpcProvider(networkId),
        },
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
