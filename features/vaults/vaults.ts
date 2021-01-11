import BigNumber from 'bignumber.js'
import { combineLatest, EMPTY, forkJoin, Observable, of } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'
import { Vault } from './vault'

interface GetCdpsArgs {
  proxyAddress: string
  descending: boolean
}

interface GetCdpsResult {
  ids: string[]
  urns: string[]
  ilks: string[]
}

const getCdps: CallDef<GetCdpsArgs, GetCdpsResult> = {
  call: ({ proxyAddress, descending }, { contract, getCdps }) => {
    console.log(proxyAddress, descending)
    return contract(getCdps).methods[`getCdps${descending ? 'Desc' : 'Asc'}`]
  },
  prepareArgs: ({ proxyAddress }, { cdpManager }) => [cdpManager.address, proxyAddress],
}

export function createVaults$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: string) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(connectedContext$, proxyAddress$(address)).pipe(
    switchMap(
      ([context, proxyAddress]): Observable<GetCdpsResult> => {
        if (!proxyAddress) return EMPTY
        return call(context, getCdps)({ proxyAddress, descending: true })
      },
    ),
    switchMap(({ ids }) => forkJoin(ids.map(vault$))),
  )
}
