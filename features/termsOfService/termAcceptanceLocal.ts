import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

export function checkAcceptanceLocalStorage$(
  token: string,
  version: string,
): Observable<{ acceptance: boolean; updated?: boolean }> {
  const acceptance = JSON.parse(localStorage.getItem(`tos-b/${token}/${version}`) || 'false')
  return of({ acceptance }).pipe(delay(500))
}

export function saveAcceptanceLocalStorage$(
  token: string,
  version: string,
  _email?: string,
): Observable<void> {
  localStorage.setItem(`tos-b/${token}/${version}`, JSON.stringify(true))
  return of(undefined).pipe(delay(500))
}
