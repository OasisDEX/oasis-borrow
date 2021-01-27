import BigNumber from 'bignumber.js'
import { combineLatest, EMPTY, forkJoin, Observable } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { GetCdps } from 'types/web3-v1-contracts/get-cdps'

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
    return descending
      ? contract<GetCdps>(getCdps).methods.getCdpsDesc
      : contract<GetCdps>(getCdps).methods.getCdpsAsc
  },
  prepareArgs: ({ proxyAddress }, { dssCdpManager }) => [dssCdpManager.address, proxyAddress],
}

export function createVaults$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: BigNumber) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(connectedContext$, proxyAddress$(address)).pipe(
    switchMap(
      ([context, proxyAddress]): Observable<GetCdpsResult> => {
        if (!proxyAddress) return EMPTY
        return call(context, getCdps)({ proxyAddress, descending: true })
      },
    ),
    switchMap(({ ids }) => combineLatest(ids.map((id) => vault$(new BigNumber(id)).pipe()))),
  )
}
