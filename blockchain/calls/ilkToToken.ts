import * as mcdGemJoinAbi from 'blockchain/abi/mcd-gem-join.json'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { contractDesc } from 'blockchain/networks'
import { defer, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { McdGemJoin } from 'types/web3-v1-contracts'

import { call, CallDef } from './callsHelpers'

export const ilkTokenAddress: CallDef<string, string> = {
  call: (ilk, { contract, chainId }) => {
    const join = getNetworkContracts(NetworkIds.MAINNET, chainId).joins[ilk]
    return contract<McdGemJoin>(contractDesc(mcdGemJoinAbi, join)).methods.gem
  },
  prepareArgs: (_ilk: string) => [],
}

export function createIlkToToken$(context$: Observable<Context>, ilk: string): Observable<string> {
  return context$.pipe(
    switchMap((context) =>
      defer(() => {
        return getNetworkContracts(NetworkIds.MAINNET, context.chainId).joins[ilk]
          ? call(context, ilkTokenAddress)(ilk)
          : undefined
      }).pipe(
        map((tokenAddress) => {
          const tokenDescription = Object.entries(
            getNetworkContracts(NetworkIds.MAINNET, context.chainId).tokens,
          ).find(([_, desc]) => desc.address.toLowerCase() === tokenAddress.toLowerCase())

          if (tokenDescription === undefined) {
            throw new Error(`Token ${tokenAddress} not found`)
          }

          if (tokenDescription[0] === 'WETH') {
            // Maker returns WETH address for ETH ilks. We need to return ETH instead.
            // We previously had misleading information in our addresses. We treated WETH address as if it was ETH address.
            return 'ETH'
          }

          return tokenDescription[0]
        }),
      ),
    ),
    shareReplay(1),
  )
}
