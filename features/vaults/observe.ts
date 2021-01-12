import { isEqual, memoize } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, first, shareReplay, switchMap } from 'rxjs/operators'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'

export function observe<A, R>(
  onEveryBlock$: Observable<number>,
  connectedContext$: Observable<ContextConnected>,
  callDef: CallDef<A, R>
): (args: A) => Observable<R> {
  return memoize((args: A) =>
    combineLatest(connectedContext$, onEveryBlock$).pipe(
      first(),
      switchMap(([context]) => call(context, callDef)(args)),
      distinctUntilChanged(isEqual),
      shareReplay(1),
    )
  )
}
