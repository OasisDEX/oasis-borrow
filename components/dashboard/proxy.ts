import { nullAddress } from '@oasisdex/utils'
import { defer, Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import { call } from '../blockchain/calls/callsHelpers'
import { ContextConnected } from '../blockchain/network'
import { owner, proxyAddress } from './dsrPot/dsProxyCalls'

export function createProxyAddress$(
  context: ContextConnected,
  account: string,
): Observable<string | undefined> {
  return defer(() =>
    call(
      context,
      proxyAddress,
    )(account).pipe(
      mergeMap((dsProxyAddress: string) => {
        if (dsProxyAddress === nullAddress) {
          return of(undefined)
        }
        return call(
          context,
          owner,
        )(dsProxyAddress).pipe(
          mergeMap((ownerAddress: string) =>
            ownerAddress === account ? of(dsProxyAddress) : of(undefined),
          ),
        )
      }),
    ),
  )
}
