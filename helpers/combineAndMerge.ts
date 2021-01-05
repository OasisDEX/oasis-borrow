/* eslint-disable no-redeclare */

import { difference } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { mergeMap, scan } from 'rxjs/operators'

type O<T> = Observable<T>

export function combineAndMerge<O1, O2>(o1: O<O1>, o2: O<O2>): O<O1 | O2>
export function combineAndMerge<O1, O2, O3>(o1: O<O1>, o2: O<O2>, o3: O<O3>): O<O1 | O2 | O3>
export function combineAndMerge<O1, O2, O3, O4>(
  o1: O<O1>,
  o2: O<O2>,
  o3: O<O3>,
  o4: O<O4>,
): O<O1 | O2 | O3 | O4>
export function combineAndMerge<O1, O2, O3, O4, O5>(
  o1: O<O1>,
  o2: O<O2>,
  o3: O<O3>,
  o4: O<O4>,
  o5: O<O5>,
): O<O1 | O2 | O3 | O4 | O5>
export function combineAndMerge<O1, O2, O3, O4, O5, O6>(
  o1: O<O1>,
  o2: O<O2>,
  o3: O<O3>,
  o4: O<O4>,
  o5: O<O5>,
  o6: O<O6>,
): O<O1 | O2 | O3 | O4 | O5 | O6>
export function combineAndMerge<O1, O2, O3, O4, O5, O6, O7>(
  o1: O<O1>,
  o2: O<O2>,
  o3: O<O3>,
  o4: O<O4>,
  o5: O<O5>,
  o6: O<O6>,
  o7: O<O7>,
): O<O1 | O2 | O3 | O4 | O5 | O6 | O7>
export function combineAndMerge<O1, O2, O3, O4, O5, O6, O7, O8>(
  o1: O<O1>,
  o2: O<O2>,
  o3: O<O3>,
  o4: O<O4>,
  o5: O<O5>,
  o6: O<O6>,
  o7: O<O7>,
  o8: O<O8>,
): O<O1 | O2 | O3 | O4 | O5 | O6 | O7 | O8>
export function combineAndMerge(...observables: Array<O<any>>): O<any> {
  return combineLatest(...observables).pipe(
    scan((previous: any[], current: any) => difference(current, previous), []),
    mergeMap((values) => of(...values)),
  )
}
