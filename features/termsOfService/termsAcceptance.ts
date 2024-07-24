import type { JWToken } from 'features/shared/jwt'
import { jwtAuthGetToken } from 'features/shared/jwt'
import type { Web3Context, Web3ContextConnected } from 'features/web3Context'
import { checkIfGnosisSafe } from 'helpers/checkIfGnosisSafe'
import type { Observable } from 'rxjs'
import { identity, merge, NEVER, of, Subject } from 'rxjs'
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
    token: JWToken,
    version: string,
  ) => Observable<{ acceptance: boolean; updated?: boolean }>,
  saveAcceptance$: (token: JWToken, version: string, email?: string) => Observable<void>,
  jwtAuthSetupToken$: (
    web3: Web3,
    chainId: number,
    account: string,
    isGnosisSafe: boolean,
  ) => Observable<JWToken>,
  version: string,
  web3Context: Web3ContextConnected,
): Observable<TermsAcceptanceState> {
  const { account, web3, magicLinkEmail, chainId } = web3Context

  // helper function used in case when user deletes his JWT from Local storage
  // we have to recheck newly issued JWT against addresses in db that acceppted terms and then eventually save them
  function checkAcceptance(token: JWToken, version: string, email?: string) {
    return checkAcceptance$(token, version).pipe(
      switchMap(({ acceptance, updated }) => {
        if (acceptance) {
          return of({ stage: 'acceptanceAccepted' } as TermsAcceptanceState)
        }

        const accept$ = new Subject<void>()
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
  }

  const isGnosisSafe = checkIfGnosisSafe(web3Context)

  const token = jwtAuthGetToken(account)

  return (
    token && token !== 'invalid'
      ? checkAcceptance$(token, version)
      : of({ acceptance: false, updated: false })
  ).pipe(
    switchMap(({ acceptance, updated }) => {
      if (acceptance) {
        return of({ stage: 'acceptanceAccepted' })
      }

      const jwtAuth$ = new Subject<boolean>()
      if (updated) {
        token === 'invalid' && localStorage.removeItem(`token-b/${account}`)
        return jwtAuthSetupToken$(web3, chainId, account, isGnosisSafe).pipe(
          switchMap((token) => {
            return checkAcceptance(token, version, magicLinkEmail)
          }),
          catchError(() => {
            return withClose({ stage: 'jwtAuthFailed' })
          }),
          startWith({
            stage: token === 'invalid' ? 'jwtInvalidProgress' : 'jwtAuthInProgress',
          }),
        )
      }
      return jwtAuth$.pipe(
        switchMap((jwtAuthAccepted) => {
          if (!jwtAuthAccepted) {
            return withClose({ stage: 'jwtAuthRejected' })
          }
          token === 'invalid' && localStorage.removeItem(`token-b/${account}`)
          return jwtAuthSetupToken$(web3, chainId, account, isGnosisSafe).pipe(
            switchMap((token) => {
              return checkAcceptance(token, version, magicLinkEmail)
            }),
            catchError(() => {
              return withClose({ stage: 'jwtAuthFailed' })
            }),
            startWith({
              stage: token === 'invalid' ? 'jwtInvalidProgress' : 'jwtAuthInProgress',
            }),
          )
        }),
        startWith({
          stage: token === 'invalid' ? 'jwtInvalidWaiting4Acceptance' : 'jwtAuthWaiting4Acceptance',
          acceptJwtAuth: () => jwtAuth$.next(true),
          rejectJwtAuth: () => jwtAuth$.next(false),
        }),
      )
    }),
    token
      ? catchError((error) => {
          return withClose({ stage: 'acceptanceCheckFailed', error })
        })
      : identity,
    token ? startWith({ stage: 'acceptanceCheckInProgress' } as TermsAcceptanceState) : identity,
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
  ) => Observable<JWToken>,
  checkAcceptance$: (
    token: JWToken,
    version: string,
  ) => Observable<{ acceptance: boolean; updated?: boolean }>,
  saveAcceptance$: (token: JWToken, version: string, email?: string) => Observable<void>,
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
