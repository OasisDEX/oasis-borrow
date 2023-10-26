import type BigNumber from 'bignumber.js'
import isEqual from 'lodash/isEqual'
import { of } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import type { Context } from './network.types'
import { NetworkIds } from './networks'

function filterSupportedIlksOnNetwork(joins: Record<string, string>, ilks: string[]): string[] {
  const supportedIlks = Object.keys(joins)
  return ilks.filter((ilk) => supportedIlks.includes(ilk))
}

export function createGetRegistryCdps$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  getRegistryCdp$: (arg: { ilk: string; usr: string }) => Observable<BigNumber | null>,
  getUserProxyAddress$: (arg: string) => Observable<string | undefined>,
  ilks: string[],
  address: string,
): Observable<BigNumber[]> {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([_, { chainId }]) =>
      getUserProxyAddress$(address).pipe(
        switchMap((proxyAddress) => {
          if (proxyAddress === undefined) {
            return of([])
          }
          const supportedIlks = filterSupportedIlksOnNetwork(
            getNetworkContracts(NetworkIds.MAINNET, chainId).joins,
            ilks,
          )

          if (supportedIlks.length === 0) {
            return of([])
          }

          return combineLatest(
            supportedIlks.map((ilk) => getRegistryCdp$({ ilk, usr: proxyAddress })),
          ).pipe(map((cdpids) => cdpids.filter((id) => id !== null)))
        }),
      ),
    ),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
