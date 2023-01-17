import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

import { UserDpmProxy } from '../../../../blockchain/userDpmProxies'

export function getAvailableDPMProxy$(
  userDpmProxies$: (account: string) => Observable<UserDpmProxy[]>,
  proxyConsumed: (proxyAddress: string) => Observable<boolean>,
  walletAddress: string,
): Observable<UserDpmProxy | undefined> {
  return userDpmProxies$(walletAddress).pipe(
    switchMap((proxies) =>
      combineLatest(
        proxies.map((proxy) =>
          proxyConsumed(proxy.proxy).pipe(
            map((hasOpenedPosition) => ({ ...proxy, hasOpenedPosition })),
          ),
        ),
      ),
    ),
    map((proxies) => proxies.find((proxy) => !proxy.hasOpenedPosition)),
    shareReplay(1),
  )
}
