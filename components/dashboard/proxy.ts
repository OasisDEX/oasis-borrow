import { nullAddress } from '@oasisdex/utils'
import { defer, Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import { call } from '../blockchain/calls/callsHelpers'
import { ContextConnected } from '../blockchain/network'
import { owner, proxyAddress } from './dsrPot/dsProxyCalls'

export function createProxyAddress$(
  context: ContextConnected,
  address: string,
): Observable<string | undefined> {
  return defer(() =>
    call(
      context,
      proxyAddress,
    )(address).pipe(
      mergeMap((dsProxyAddress: string) => {
        if (dsProxyAddress === nullAddress) {
          return of(undefined)
        }
        return dsProxyAddress
      }),
    ),
  )
}

export function createProxyOwner$(
  context: ContextConnected,
  proxyAddress: string,
): Observable<string | undefined> {
  return call(
    context,
    owner,
  )(proxyAddress).pipe(
    mergeMap((ownerAddress: string) =>
      ownerAddress === proxyAddress ? of(ownerAddress) : of(undefined),
    ),
  )
}
