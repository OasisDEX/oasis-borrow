import * as dsProxy from 'blockchain/abi/ds-proxy.json'
import { contractDesc } from 'blockchain/config'

import { defer, Observable, of } from 'rxjs'
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators'
import { McdGemJoin } from 'types/web3-v1-contracts/mcd-gem-join'
import { Erc20 } from 'types/web3-v1-contracts/erc20'
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

export const tokenSymbol: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract<any>(contractDesc(dsProxy, dsProxyAddress)).methods.symbol,
  prepareArgs: (_tokenAddress: string) => [],
}

export function createIlkToToken$(context$: Observable<Context>, ilk: string): Observable<string> {
  return context$.pipe(
    switchMap((context) =>
      defer(() => call(context, ilkTokenAddress)(ilk)).pipe(
        switchMap((tokenAddress) => defer(() => call(context, tokenSymbol)(tokenAddress))),
      ),
    ),
    catchError(() => of(undefined)),
    shareReplay(1),
  )
}
