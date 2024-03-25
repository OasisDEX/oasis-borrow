import type { Context } from 'blockchain/network.types'
import { isEqual, memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import type { CallDef } from './callsHelpers'
import { call } from './callsHelpers'

export function observe<A, R>(
  refreshTrigger$: Observable<any>,
  connectedContext$: Observable<Context>,
  callDef: CallDef<A, R>,
  resolver?: (args: A) => string,
): (args: A) => Observable<R> {
  return memoize(
    (args: A) =>
      combineLatest(connectedContext$, refreshTrigger$).pipe(
        switchMap(([context]) => call(context, callDef)(args)),
        distinctUntilChanged(isEqual),
        shareReplay(1),
      ),
    resolver,
  )
}

export type CallObservable<C extends CallDef<any, any>> =
  C extends CallDef<infer A, infer R> ? (a: A) => Observable<R> : never
