import { nullAddress } from '@oasisdex/utils'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.json'
import { contractDesc } from 'components/blockchain/config'
import { defer, EMPTY, Observable, of } from 'rxjs'
import { catchError, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DsProxyRegistry } from 'types/web3-v1-contracts/ds-proxy-registry'

import { ContextConnected } from '../network'
import { call, CallDef } from './callsHelpers'

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export function createProxyAddress$(
  connectedContext$: Observable<ContextConnected>,
  address: string,
): Observable<string> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(
          context,
          proxyAddress,
        )(address).pipe(
          mergeMap((proxyAddress: string) => {
            if (proxyAddress === nullAddress) {
              return EMPTY
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
  connectedContext$: Observable<ContextConnected>,
  proxyAddress: string,
): Observable<string> {
  return connectedContext$.pipe(
    switchMap((context) =>
      defer(() =>
        call(context, owner)(proxyAddress).pipe(map((ownerAddress: string) => ownerAddress)),
      ),
    ),
    catchError(() => EMPTY),
    shareReplay(1),
  )
}
