import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

export function checkReferralLocalStorage$(): Observable<string | null> {
  let referrer = localStorage.getItem(`referral`)
  if (referrer === 'null') {
    referrer = null
  }
  return of(referrer).pipe(delay(1000))
}
