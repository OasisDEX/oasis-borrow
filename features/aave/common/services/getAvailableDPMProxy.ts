import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export function getAvailableDPMProxy$(
  userDpmProxies$: (account: string) => Observable<UserDpmAccount[]>,
  proxyConsumed: (proxyAddress: string) => Observable<boolean>,
  walletAddress: string,
): Observable<UserDpmAccount | undefined> {
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
