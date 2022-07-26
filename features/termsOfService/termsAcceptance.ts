import { Web3Context, Web3ContextConnected } from '@oasisdex/web3-context'
import { identity, merge, NEVER, Observable, of, Subject } from 'rxjs'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { catchError, map, repeat, shareReplay, startWith, switchMap } from 'rxjs/operators'
import Web3 from 'web3'

import { jwtAuthGetToken, JWToken } from './jwt'
import { checkAcceptanceLocalStorage$, saveAcceptanceLocalStorage$ } from './termAcceptanceLocal'

export type TermsAcceptanceStage =
  | 'walletConnectionInProgress'
  | 'acceptanceCheckInProgress'
  | 'acceptanceCheckFailed'
  | 'acceptanceWaiting4TOSAcceptance'
  | 'jwtAuthWaiting4Acceptance'
  | 'jwtAuthInProgress'
  | 'jwtAuthFailed'
  | 'jwtAuthRejected'
  | 'acceptanceSaveInProgress'
  | 'acceptanceSaveFailed'
  | 'acceptanceAccepted'
  | 'acceptanceProcessClosed'

export interface TermsAcceptanceState {
  stage: TermsAcceptanceStage
  acceptTOS?: () => void
  acceptJwtAuth?: () => void
  rejectJwtAuth?: () => void
  restart?: () => void
  tryAgain?: () => void
  error?: any
  updated?: boolean
}

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
  jwtAuthSetupToken$: (web3: Web3, account: string) => Observable<JWToken>,
  version: string,
  web3Context: Web3ContextConnected,
): Observable<TermsAcceptanceState> {
  const { account, web3, magicLinkEmail, connectionKind } = web3Context

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

  function checkAcceptanceGnosis(token: JWToken, version: string) {
    return checkAcceptanceLocalStorage$(token, version).pipe(
      switchMap(({ acceptance, updated }) => {
        if (acceptance) {
          return of({ stage: 'acceptanceAccepted' } as TermsAcceptanceState)
        }

        const accept$ = new Subject<void>()
        return accept$.pipe(
          switchMap(() => {
            return saveAcceptanceLocalStorage$(token, version).pipe(
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

  let isGnosisSafe = false

  // check if current provider is Gnosis connected by WalletConnect or by dedicated web3-react-connector
  if (connectionKind === 'walletConnect') {
    // @ts-ignore
    if (web3.currentProvider.wc) {
      // @ts-ignore
      isGnosisSafe = web3.currentProvider.wc?._peerMeta?.name.includes('Gnosis')
    }
  }

  if (connectionKind === 'gnosisSafe') {
    isGnosisSafe = true
  }

  if (isGnosisSafe) {
    // temporary ToS flow for Gnosis until they implement off chain signatures
    // saving and checking from Local storage and skipping JWT token set up
    return checkAcceptanceGnosis(`${account}-gnosis`, version)
  }

  const token = jwtAuthGetToken(account)

  return (token
    ? checkAcceptance$(token, version)
    : of({ acceptance: false, updated: false })
  ).pipe(
    switchMap(({ acceptance, updated }) => {
      if (acceptance) {
        return of({ stage: 'acceptanceAccepted' })
      }

      const jwtAuth$ = new Subject<boolean>()
      if (updated) {
        return jwtAuthSetupToken$(web3, account).pipe(
          switchMap((token) => {
            return checkAcceptance(token, version, magicLinkEmail)
          }),
          catchError(() => {
            return withClose({ stage: 'jwtAuthFailed' })
          }),
          startWith({
            stage: 'jwtAuthInProgress',
          }),
        )
      }
      return jwtAuth$.pipe(
        switchMap((jwtAuthAccepted) => {
          if (!jwtAuthAccepted) {
            return withClose({ stage: 'jwtAuthRejected' })
          }
          return jwtAuthSetupToken$(web3, account).pipe(
            switchMap((token) => {
              return checkAcceptance(token, version, magicLinkEmail)
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
  jwtAuthSetupToken$: (web3: Web3, account: string) => Observable<JWToken>,
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
