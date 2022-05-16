import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

export function checkReferralLocalStorage$(): Observable<{ referrer: string }> {
  const referrer = localStorage.getItem(`referral`)
  return of({ referrer }).pipe(delay(500))
}