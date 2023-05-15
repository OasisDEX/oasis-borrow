import { ethers } from 'ethers'
import { getNetworkRpcEndpoint } from 'helpers/networkHelpers'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Context } from './network'
import { NetworkIds } from './networkIds'

export function resolveENSName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    switchMap(async (context) => {
      const provider = new ethers.providers.JsonRpcProvider(
        getNetworkRpcEndpoint(NetworkIds.MAINNET, context.chainId),
      )
      return await provider
        .lookupAddress(address)
        .catch((err: Error) =>
          console.warn(`Error looking up ENS name for address: ${err.message}`),
        )
    }),
  )
}
