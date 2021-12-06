import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
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
