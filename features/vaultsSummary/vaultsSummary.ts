import { combineLatest, Observable, of, defer } from 'rxjs'
import { ContextConnected, Context, EveryBlockFunction$ } from '../../components/blockchain/network'
import { mergeMap, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { zipWith } from 'lodash'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { contractDesc } from 'components/blockchain/config'
import { nullAddress } from '@oasisdex/utils'

interface VaultSummary {
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
  vaultIds: string[]
  vaultAddresses: string[]
  vaultTypes: string[]
}

// TODO: replace with sth from web3/ethers
function bytesToString(hex: string): string {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString().replace(/\x00/g, '') // eslint-disable-line no-control-regex
}

const getCdps: CallDef<GetCdpsArgs, VaultSummary[]> = {
  call: ({ proxyAddress, descending }, { contract, getCdps }) =>
    contract(getCdps).methods[`getCdps${descending ? 'Desc' : 'Asc'}`],
  prepareArgs: ({ proxyAddress }, { cdpManager }) => [cdpManager.address, proxyAddress],
  postprocess: ({ vaultIds, vaultAddresses, vaultTypes }: any): VaultSummary[] =>
    zipWith(vaultIds, vaultTypes, (id: string, type: string) => ({ id, type })),
}

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

// const proxyAddress$ = connectedContext$.pipe(
//   switchMap((context) => everyBlock$(createProxyAddress$(context, context.account))),
//   shareReplay(1),
// )

export function createProxyAddress$(
  context: ContextConnected,
  address: string,
): Observable<string | undefined> {
  return defer(() =>
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
  )
}

export function createProxyOwner$(
  context: ContextConnected,
  proxyAddress: string,
): Observable<string | undefined> {
  return defer(() =>
    call(
      context,
      owner,
    )(proxyAddress).pipe(
      mergeMap((ownerAddress: string) =>
        ownerAddress === proxyAddress ? of(ownerAddress) : of(undefined),
      ),
    ),
  )
}

// export function createVaultSummary$(
//   context$: Observable<Context>,
//   proxyAddress$: (address: string) => Observable<string>,
//   address: string,
// ): Observable<VaultsSummary> {
//   return combineLatest(context$, proxyAddress$(address)).pipe(
//     switchMap(([context, proxyAddress]) => {
//       return call(context, getCdps)({ descending: true, proxyAddress })
//     }),
//   )
// }
