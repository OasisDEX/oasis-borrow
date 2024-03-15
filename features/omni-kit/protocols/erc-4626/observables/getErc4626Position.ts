import type { Erc4626Position } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  getErc4626ApyParameters,
  getErc4626PositionParameters,
} from 'features/omni-kit/protocols/erc-4626/helpers'
import type { Erc4626Token } from 'features/omni-kit/protocols/erc-4626/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getErc4626Position$(
  onEveryBlock$: Observable<number> | undefined,
  quotePrice: BigNumber,
  vaultAddress: string,
  underlyingAsset: Erc4626Token,
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
          underlyingAsset,
        },
        {
          provider: getRpcProvider(networkId),
          getVaultApyParameters: getErc4626ApyParameters,
          getLazyVaultSubgraphResponse: getErc4626PositionParameters(networkId),
        },
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
