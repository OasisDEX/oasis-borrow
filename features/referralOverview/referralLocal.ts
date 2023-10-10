import { isAddress } from 'ethers/lib/utils'
import type { Observable, Subject } from 'rxjs'
import { of } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

/**
 * Checks the referral value in local storage.
 * @param {Subject<void>} trigger$ A subject that triggers the observable to emit a new value.
 * @returns {Observable<string | null>} An observable that emits the referral value from local storage,
 * or null if the referral is not valid or not found.
 * @dev since we only store the referrer address in local storage, we need to check if it's a valid address
 * before returning it. If not it means that the referral is not valid and we remove it from local storage.
 * The observable is triggered to emit a new value whenever the `trigger$` subject emits a new value.
 * This allows you to manually trigger the observable to check the local storage for changes.
 * The observable is also triggered to emit a new value whenever the local storage changes in another tab or window.
 */
export function checkReferralLocalStorage$(trigger$: Subject<void>): Observable<string | null> {
  return trigger$.pipe(
    startWith(localStorage.getItem(`referral`)),
    switchMap(() => {
      const referrer = localStorage.getItem(`referral`)
      if (referrer && isAddress(referrer.slice(1, -1))) {
        return of(referrer)
      } else if (referrer === 'null') {
        return of(null)
      } else {
        localStorage.removeItem(`referral`)
        return of(null)
      }
    }),
  )
}
