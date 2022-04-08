import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

export function checkReferralLocalStorage$(): Observable<{ address: string; updated?: boolean }> {
  const address = JSON.parse(localStorage.getItem(`referral`) || 'false')
  return of({ address }).pipe(delay(500))
}

export function saveReferralLocalStorage$(referral: string): Observable<void> {
  localStorage.setItem(`referral`, referral)
  return of(undefined).pipe(delay(500))
}
