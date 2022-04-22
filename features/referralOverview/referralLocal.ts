import { Observable, of } from 'rxjs'
import {  delay } from 'rxjs/operators'

export function checkReferralLocalStorage$(): Observable<{ referral: string }> {
  const referral = localStorage.getItem(`referral`)
  return of({ referral }).pipe(delay(500))
}

/* export function saveReferralLocalStorage$(
  checkReferralLocalStorage$: Observable<{ referral: string }>,
): Observable<void> {
  return checkReferralLocalStorage$.pipe(
    switchMap((checkReferralLocalStorage) => {
      if (checkReferralLocalStorage.referral.length !== 0) {
        const router = useRouter()
        const linkReferral = router.query.ref as string
        localStorage.setItem(`referral`, linkReferral)
      }
      return of(undefined).pipe(delay(500))
    }),
  )
} */
/* 
export function checkReferral$(
  checkReferralLocalStorage$: Observable<{referral: string}>
):Observable<> {
  return checkReferralLocalStorage$.pipe(
    switchMap((checkReferralLocalStorage) => {
      if (checkReferralLocalStorage.referral) {
        return of({ stage: 'acceptanceAccepted' } as TermsAcceptanceState)
      }

      // const accept$ = new Subject<void>()
      return accept$.pipe(
        switchMap(() => {
          return saveAcceptance$(token, version, email).pipe(
            map(() => ({ stage: 'acceptanceAccepted' })),
            catchError((error) =>
              of({ stage: 'acceptanceSaveFailed', error } as TermsAcceptanceState),
            ),
            startWith({ stage: 'acceptanceSaveInProgress' }),
          )
        }),
        startWith({
          stage: 'acceptanceWaiting4TOSAcceptance',
          acceptTOS: () => accept$.next(),
          updated,
        }),
      )
    }),
    catchError((error) => withClose({ stage: 'acceptanceCheckFailed', error })),
    startWith({ stage: 'acceptanceCheckInProgress' } as TermsAcceptanceState),
  )
} */
