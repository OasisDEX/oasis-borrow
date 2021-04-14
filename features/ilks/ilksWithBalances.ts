import BigNumber from 'bignumber.js'
import { IlkData, IlkDataList } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { TokenBalances } from 'blockchain/tokens'
import isEqual from 'lodash/isEqual'
import { combineLatest, Observable, of } from 'rxjs'
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
