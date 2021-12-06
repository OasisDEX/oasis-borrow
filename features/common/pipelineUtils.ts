import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { combineLatest, iif, Observable, throwError } from 'rxjs'
import { first, shareReplay, switchMap } from 'rxjs/operators'

export function provideContext<T>(
  ilk: string,
  ilks$: Observable<string[]>,
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  handler: (
    contextConnected: ContextConnected,
    txHelpers: TxHelpers,
    ilkData: IlkData,
  ) => Observable<T>,
): Observable<T> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkData$(ilk)).pipe(
          first(),
          switchMap(([context, txHelper, ilkData]) => {
            return handler(context, txHelper, ilkData)
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}

export function provideExternalPricesChangesContext<T>(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  handler: (
    priceInfo: PriceInfo,
    balanceInfo: BalanceInfo,
    proxyAddress: string | undefined,
  ) => Observable<T>,
  token: string,
  account: string,
  token0: string = token,
): Observable<T> {
  return combineLatest(
    priceInfo$(token),
    balanceInfo$(token0, account),
    proxyAddress$(account),
  ).pipe(
    first(),
    switchMap(([priceInfo, balanceInfo, proxyAddress]) => {
      return handler(priceInfo, balanceInfo, proxyAddress)
    }),
  )
}
