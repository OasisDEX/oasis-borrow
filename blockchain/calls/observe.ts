import { isEqual, memoize } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import { Context } from '../network'
import { call, CallDef } from './callsHelpers'

export function observe<A, R>(
  onEveryBlock$: Observable<number>,
  connectedContext$: Observable<Context>,
  callDef: CallDef<A, R>,
  resolver?: (args: A) => string,
): (args: A) => Observable<R> {
  return memoize(
    (args: A) =>
      combineLatest(connectedContext$, onEveryBlock$).pipe(
        switchMap(([context]) => call(context, callDef)(args)),
        distinctUntilChanged(isEqual),
        shareReplay(1),
      ),
    resolver,
  )
}

export type CallObservable<C extends CallDef<any, any>> = C extends CallDef<infer A, infer R>
  ? (a: A) => Observable<R>
  : never
