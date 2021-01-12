import { nullAddress } from '@oasisdex/utils'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { contractDesc } from 'components/blockchain/config'
import { defer, EMPTY, Observable, of } from 'rxjs'
import { catchError, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods.proxies,
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
    contract(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
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
