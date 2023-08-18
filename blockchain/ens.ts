import { ethers } from 'ethers'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Context } from './network'
import { getNetworkRpcEndpoint, NetworkIds } from './networks'

export function resolveENSName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    switchMap(async (context) => {
      const provider = new ethers.providers.JsonRpcBatchProvider(
        getNetworkRpcEndpoint(context.chainId),
      )
      return await provider
        .lookupAddress(address)
        .catch((err: Error) =>
          console.warn(`Error looking up ENS name for address: ${err.message}`),
        )
    }),
  )
}

// address => ens name
export async function addressToEnsNameMainnet(ensName: string) {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET),
  )
  return await provider.lookupAddress(ensName).catch((err: Error) => {
    console.warn(`Error looking up ENS name for address: ${ensName}/${err.message}`)
    return null
  })
}

// ens name => address
export async function ensNameToAddressMainnet(address: string) {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET),
  )
  return await provider.resolveName(address).catch((err: Error) => {
    console.warn(`Error looking up ENS name for address: ${err.message}`)
    return null
  })
}
