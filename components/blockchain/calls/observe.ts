import { isEqual, memoize } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, first, shareReplay, switchMap } from 'rxjs/operators'

import { Context } from '../network'
import { call, CallDef } from './callsHelpers'

export function observe<A, R>(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  callDef: CallDef<A, R>,
  resolver?: (args: A) => string,
): (args: A) => Observable<R> {
  return memoize(
    (args: A) =>
      combineLatest(context$, onEveryBlock$).pipe(
        first(),
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
