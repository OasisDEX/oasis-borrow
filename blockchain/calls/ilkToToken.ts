import { contractDesc } from 'blockchain/config'
import { defer, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { McdGemJoin } from 'types/web3-v1-contracts/mcd-gem-join'

import * as mcdGemJoinAbi from '../abi/mcd-gem-join.json'
import { Context } from '../network'
import { call, CallDef } from './callsHelpers'

export const ilkTokenAddress: CallDef<string, string> = {
  call: (ilk, { contract, joins }) => {
    const join = joins[ilk]
    return contract<McdGemJoin>(contractDesc(mcdGemJoinAbi, join)).methods.gem
  },
  prepareArgs: (_ilk: string) => [],
}

export function createIlkToToken$(context$: Observable<Context>, ilk: string): Observable<string> {
  return context$.pipe(
    switchMap((context) =>
      defer(() => call(context, ilkTokenAddress)(ilk)).pipe(
        map((tokenAddress) => {
          const tokenDescription = Object.entries(context.tokens).find(
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
