import { nullAddress } from '@oasisdex/utils'
import * as dsProxy from 'blockchain/abi/ds-proxy.json'
import { contractDesc } from 'blockchain/config'
import { defer, EMPTY, Observable, of } from 'rxjs'
import { catchError, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DsProxyRegistry } from 'types/web3-v1-contracts/ds-proxy-registry'
import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

import { Context, ContextConnected } from '../network'
import { call, CallDef } from './callsHelpers'

export const proxyAddress: CallDef<string, string> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export function createProxyAddress$(
  context$: Observable<Context>,
  address: string,
): Observable<string | undefined> {
  return context$.pipe(
    switchMap((context) =>
      defer(() =>
        call(
          context,
          proxyAddress,
        )(address).pipe(
          mergeMap((proxyAddress) => {
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
    contract<DsProxy>(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export function createProxyOwner$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<string> {
  return context$.pipe(
    switchMap((context) =>
      defer(() =>
        call(context, owner)(proxyAddress).pipe(map((ownerAddress: string) => ownerAddress)),
      ),
    ),
    catchError(() => EMPTY),
    shareReplay(1),
  )
}

export type CreateDsProxyData = {
  kind: TxMetaKind.createDsProxy
}

export const createDsProxy: TransactionDef<CreateDsProxyData> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.build,
  prepareArgs: () => [],
}
