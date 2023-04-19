import * as mcdGemJoinAbi from 'blockchain/abi/mcd-gem-join.json'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { contractDesc } from 'blockchain/networksConfig'
import { defer, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { McdGemJoin } from 'types/web3-v1-contracts'

import { call, CallDef } from './callsHelpers'

export const ilkTokenAddress: CallDef<string, string> = {
  call: (ilk, { contract, chainId }) => {
    const join = getNetworkContracts(chainId).joins[ilk]
    return contract<McdGemJoin>(contractDesc(mcdGemJoinAbi, join)).methods.gem
  },
  prepareArgs: (_ilk: string) => [],
}

export function createIlkToToken$(context$: Observable<Context>, ilk: string): Observable<string> {
  return context$.pipe(
    switchMap((context) =>
      defer(() => call(context, ilkTokenAddress)(ilk)).pipe(
        map((tokenAddress) => {
          const tokenDescription = Object.entries(getNetworkContracts(context.chainId).tokens).find(
            ([_, desc]) => desc.address.toLowerCase() === tokenAddress.toLowerCase(),
          )

          if (tokenDescription === undefined) {
            throw new Error(`Token ${tokenAddress} not found`)
          }

          return tokenDescription[0]
        }),
      ),
    ),
    shareReplay(1),
  )
}
