import { nullAddress } from '@oasisdex/utils'
import { call } from 'blockchain/calls/callsHelpers'
import { owner, proxyAddress } from 'blockchain/calls/proxy'
import type { Context } from 'blockchain/network.types'
import type { Observable } from 'rxjs'
import { defer, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

export function createProxyAddress$(
  context: Context,
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
            ownerAddress.toLowerCase() === account.toLowerCase()
              ? of(dsProxyAddress)
              : of(undefined),
          ),
        )
      }),
    ),
  )
}
