import type { ContextConnected } from 'blockchain/network.types'
import { startWithDefault } from 'helpers/operators'
import type { Observable } from 'rxjs'
import { iif, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export function hasActiveAavePositionOnDsProxy$(
  context$: Observable<ContextConnected>,
  proxyAddress$: (walletAddress: string) => Observable<string | undefined>,
  hasAavePosition$: (proxyAddress: string) => Observable<boolean>,
): Observable<boolean> {
  return context$.pipe(
    switchMap((context) => proxyAddress$(context.account)),
    switchMap((proxyAddress) =>
      iif(
        () => proxyAddress !== undefined,
        startWithDefault(hasAavePosition$(proxyAddress!), false),
        of(false),
      ),
    ),
  )
}
