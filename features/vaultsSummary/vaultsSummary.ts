import { combineLatest, Observable, of, defer } from 'rxjs'
import { ContextConnected, Context, EveryBlockFunction$ } from '../../components/blockchain/network'
import { catchError, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { zipWith } from 'lodash'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { contractDesc } from 'components/blockchain/config'
import { nullAddress } from '@oasisdex/utils'

export interface VaultSummary {
  id: string
  type: string // ilk
}

interface Vault extends VaultSummary {
  address: string
  owner: string
  // ...
}

interface VaultsSummary {
  vaults: Vault[]
}

interface GetCdpsArgs {
  proxyAddress: string
  descending: boolean
}

interface GetCdpsResult {
  ids: string[]
  urns: string[]
  ilks: string[]
}

// TODO: replace with sth from web3/ethers
function bytesToString(hex: string): string {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString().replace(/\x00/g, '') // eslint-disable-line no-control-regex
}

const getCdps: CallDef<GetCdpsArgs, VaultSummary[]> = {
  call: ({ proxyAddress, descending }, { contract, getCdps }) => {
    console.log(proxyAddress, descending)
    return contract(getCdps).methods[`getCdps${descending ? 'Desc' : 'Asc'}`]
  },
  prepareArgs: ({ proxyAddress }, { cdpManager }) => [cdpManager.address, proxyAddress],
  postprocess: ({ ids, urns, ilks }: GetCdpsResult): VaultSummary[] => {
    return zipWith(ids, ilks, (id: string, ilk: string) => ({ id, type: bytesToString(ilk) }))
  },
}

export function createVaultSummary$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  address: string,
): Observable<VaultSummary[]> {
  return combineLatest(connectedContext$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of([])
      return call(context, getCdps)({ proxyAddress, descending: true })
    }),
  )
}

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export function createProxyAddress$(
  connectedContext$: Observable<ContextConnected>,
  address: string,
): Observable<string | undefined> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(
          context,
          proxyAddress,
        )(address).pipe(
          mergeMap((proxyAddress: string) => {
            if (proxyAddress === nullAddress) {
              return of(undefined)
            }
            return of(proxyAddress)
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export function createProxyOwner$(
  connectedContext$: Observable<ContextConnected>,
  proxyAddress: string,
): Observable<string | undefined> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(context, owner)(proxyAddress).pipe(map((ownerAddress: string) => ownerAddress)),
      ),
    ),
    catchError(() => of(undefined)),
    shareReplay(1),
  )
}
