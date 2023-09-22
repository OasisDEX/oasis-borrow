import type BigNumber from 'bignumber.js'
import type { IlkData, IlkDataList } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import type { TokenBalances } from 'blockchain/tokens.types'
import isEqual from 'lodash/isEqual'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export interface IlkWithBalance extends IlkData {
  balance?: BigNumber
  balancePriceInUsd?: BigNumber
}

export function createIlkDataListWithBalances$(
  context: Observable<Context>,
  ilkDataList$: Observable<IlkDataList>,
  balances$: (address: string) => Observable<TokenBalances>,
): Observable<IlkWithBalance[]> {
  return context.pipe(
    switchMap((context) =>
      context.status === 'connected'
        ? combineLatest(
            ilkDataList$,
            balances$(context.account).pipe(distinctUntilChanged(isEqual)),
          )
        : combineLatest(ilkDataList$, of({})),
    ),
    map(([ilkData, balances]) =>
      ilkData.map((ilk) =>
        ilk.token in balances
          ? {
              ...ilk,
              balance: balances[ilk.token].balance,
              balancePriceInUsd: balances[ilk.token].balance.times(balances[ilk.token].price),
            }
          : ilk,
      ),
    ),
    shareReplay(1),
  )
}
