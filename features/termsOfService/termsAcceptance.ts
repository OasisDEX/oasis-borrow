import type { Web3Context, Web3ContextConnected } from 'features/web3Context'
import { checkIfGnosisSafe } from 'helpers/checkIfGnosisSafe'
import type { Observable } from 'rxjs'
import { merge, NEVER, of, Subject } from 'rxjs'
import { catchError, map, repeat, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import type Web3 from 'web3'

import type { TermsAcceptanceState } from './termsAcceptance.types'

function withClose(state: TermsAcceptanceState): Observable<TermsAcceptanceState> {
  const close$ = new Subject<void>()
  return close$.pipe(
    map(() => ({ stage: 'acceptanceProcessClosed' })),
    startWith({
      ...state,
      tryAgain: () => {
        close$.next()
      },
    }),
  )
}

function verifyAcceptance$(
  checkAcceptance$: (
    version: string,
    walletAddress: string,
  ) => Observable<{ acceptance: boolean; updated?: boolean; authorized?: boolean }>,
  saveAcceptance$: (version: string, walletAddress: string) => Observable<void>,
  jwtAuthSetupToken$: (
    web3: Web3,
    chainId: number,
    account: string,
    isGnosisSafe: boolean,
  ) => Observable<string>,
  version: string,
  web3Context: Web3ContextConnected,
): Observable<TermsAcceptanceState> {
  const { account, web3, chainId } = web3Context

  // helper function used in case when user deletes his JWT from Local storage
  // we have to recheck newly issued JWT against addresses in db that acceppted terms and then eventually save them
  function checkAcceptance(version: string, walletAddress: string) {
    return checkAcceptance$(version, walletAddress).pipe(
      switchMap(({ acceptance, updated, authorized }) => {
        if (acceptance && authorized) {
          return of({ stage: 'acceptanceAccepted' } as TermsAcceptanceState)
        }

        const accept$ = new Subject<void>()

        return accept$.pipe(
          switchMap(() => {
            return saveAcceptance$(version, walletAddress).pipe(
              map(() => ({ stage: 'acceptanceAccepted' })),
              catchError((error) => {
                return withClose({ stage: 'acceptanceSaveFailed', error })
              }),
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
  }

  const isGnosisSafe = checkIfGnosisSafe(web3Context)

  return checkAcceptance$(version, account).pipe(
    switchMap(({ acceptance, authorized }) => {
      if (acceptance && authorized) {
        return of({ stage: 'acceptanceAccepted' })
      }

      const jwtAuth$ = new Subject<boolean>()

      return jwtAuth$.pipe(
        switchMap((jwtAuthAccepted) => {
          if (!jwtAuthAccepted) {
            return withClose({ stage: 'jwtAuthRejected' })
          }
          return jwtAuthSetupToken$(web3, chainId, account, isGnosisSafe).pipe(
            switchMap(() => {
              return checkAcceptance(version, account)
            }),
            catchError(() => {
              return withClose({ stage: 'jwtAuthFailed' })
            }),
            startWith({
              stage: 'jwtAuthInProgress',
            }),
          )
        }),
        startWith({
          stage: 'jwtAuthWaiting4Acceptance',
          acceptJwtAuth: () => jwtAuth$.next(true),
          rejectJwtAuth: () => jwtAuth$.next(false),
        }),
      )
    }),
    catchError((error) => {
      return withClose({ stage: 'acceptanceCheckFailed', error })
    }),
    startWith({ stage: 'acceptanceCheckInProgress' } as TermsAcceptanceState),
  )
}

export function createTermsAcceptance$(
  web3Context$: Observable<Web3Context>,
  version: string,
  jwtAuthSetupToken$: (
    web3: Web3,
    chainId: number,
    account: string,
    isGnosisSafe: boolean,
  ) => Observable<string>,
  checkAcceptance$: (
    version: string,
    walletAddress: string,
  ) => Observable<{ acceptance: boolean; updated?: boolean; authorized?: boolean }>,
  saveAcceptance$: (version: string, walletAddress: string) => Observable<void>,
): Observable<TermsAcceptanceState> {
  return web3Context$.pipe(
    switchMap((web3Context) => {
      if (web3Context.status !== 'connected') {
        return of({ stage: 'walletConnectionInProgress' } as TermsAcceptanceState)
      }

      const verifyAcceptanceFlow$ = verifyAcceptance$(
        checkAcceptance$,
        saveAcceptance$,
        jwtAuthSetupToken$,
        version,
        web3Context,
      )

      return merge(verifyAcceptanceFlow$, NEVER).pipe(
        takeWhileInclusive(({ stage }) => stage !== 'acceptanceProcessClosed'),
        repeat(),
      )
    }),
    shareReplay(1),
  )
}
