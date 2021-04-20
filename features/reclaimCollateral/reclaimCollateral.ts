import { BigNumber } from 'bignumber.js'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { scan, startWith, switchMap } from 'rxjs/operators'

import { ReclaimChange, reclaimCollateral } from './reclaimCollateralTransactions'
import { Context } from '@oasisdex/transactions/lib/src/callHelpersContextParametrized'

interface ReclaimState {
  reclaim: () => void
  txStatus?: string
}

export function apply(state: ReclaimState, change: ReclaimChange): ReclaimState {
  return {
    ...state,
    txStatus: change.kind,
  }
}

export function createReclaimCollateral$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  id: BigNumber,
  token: string,
  amount: BigNumber,
) {
  const change$ = new Subject<ReclaimChange>()

  function change(ch: ReclaimChange) {
    change$.next(ch)
  }

  return context$.pipe(
    switchMap((context) => {
      if (context.status !== 'connected') {
        return of(undefined)
      }

      return combineLatest(txHelpers$, proxyAddress$((context as ContextConnected).account)).pipe(
        switchMap(([txHelpers, proxyAddress]) => {
          const initialState = {
            reclaim: () =>
              reclaimCollateral(txHelpers, proxyAddress!, amount, token, id).subscribe((ch) =>
                change(ch),
              ),
          }

          return change$.pipe(scan(apply, initialState), startWith(initialState))
        }),
      )
    }),
  )
}
