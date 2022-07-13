import { Observable, of } from 'rxjs'

export function checkReferralLocalStorage$(): Observable<string | null> {
  let referrer = localStorage.getItem(`referral`)
  if (referrer === 'null') {
    referrer = null
  }
  return of(referrer)
}
