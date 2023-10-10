import { nullAddress } from '@oasisdex/utils'
import * as dsProxy from 'blockchain/abi/ds-proxy.json'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { contractDesc, NetworkIds } from 'blockchain/networks'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, defer, of } from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  map,
  mergeMap,
  shareReplay,
  switchMap,
} from 'rxjs/operators'
import type { DsProxy, DsProxyRegistry } from 'types/web3-v1-contracts'

import type { CallDef, TransactionDef } from './callsHelpers'
import { call } from './callsHelpers'
import type { TxMetaKind } from './txMeta'

export const proxyAddress: CallDef<string, string> = {
  call: (_, { chainId, contract }) =>
    contract<DsProxyRegistry>(getNetworkContracts(NetworkIds.MAINNET, chainId).dsProxyRegistry)
      .methods.proxies,
  prepareArgs: (address) => [address],
}

// we probably should be more clever on
// continually polling like this as the
// proxy address is fixed in the majority
// of cases
export function createProxyAddress$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  address: string,
): Observable<string | undefined> {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([_, context]) =>
      defer(() =>
        call(
          context,
          proxyAddress,
        )(address).pipe(
          mergeMap((proxyAddress) => {
            if (proxyAddress === nullAddress) {
              return of(undefined)
            }
            return call(
              context,
              owner,
            )(proxyAddress).pipe(
              mergeMap((ownerAddress: string) =>
                ownerAddress === address ? of(proxyAddress) : of(undefined),
              ),
            )
          }),
        ),
      ),
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export function createProxyOwner$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<string | undefined> {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([_, context]) =>
      defer(() =>
        call(context, owner)(proxyAddress).pipe(map((ownerAddress: string) => ownerAddress)),
      ),
    ),
    catchError(() => of(undefined)),
    shareReplay(1),
  )
}

export type CreateDsProxyData = {
  kind: TxMetaKind.createDsProxy
}

export const createDsProxy: TransactionDef<CreateDsProxyData> = {
  call: (_, { chainId, contract }) =>
    contract<DsProxyRegistry>(getNetworkContracts(NetworkIds.MAINNET, chainId).dsProxyRegistry)
      .methods['build()'],
  prepareArgs: () => [],
}

export type SetProxyOwnerData = {
  kind: TxMetaKind.setProxyOwner
  proxyAddress: string
  owner: string
}

export const setProxyOwner: TransactionDef<SetProxyOwnerData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.setOwner,
  prepareArgs: ({ owner }: SetProxyOwnerData) => [owner],
  options: () => ({ gas: 1000000 }),
}
