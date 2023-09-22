import type { Web3Context } from 'features/web3Context'
import { getStateUnpacker } from 'helpers/testHelpers'
import { mapValues } from 'lodash'
import { NEVER, Observable, of, throwError } from 'rxjs'
import type Web3 from 'web3'

import { createTermsAcceptance$ } from './termsAcceptance'
import type { TermsAcceptanceState } from './termsAcceptance.types'

interface PipelineInput {
  web3Context$: Observable<Web3Context>
  version: string
  jwtAuthSetupToken$: () => Observable<never | string>
  checkAcceptance$: () => Observable<never | { acceptance: boolean; updated?: boolean }>
  saveAcceptance$: () => Observable<never | void>
}

const defaultParams: PipelineInput = {
  web3Context$: of({
    status: 'connected',
    account: '0x123',
    web3: {} as Web3,
    connectionKind: 'injected',
    chainId: 42,
    deactivate: () => null,
    walletLabel: 'MetaMask',
    connectionMethod: 'web3-onboard',
    transactionProvider: {} as any,
  }),
  version: 'v1',
  jwtAuthSetupToken$: () => NEVER,
  checkAcceptance$: () => NEVER,
  saveAcceptance$: () => NEVER,
}

function createState$(overrides?: Partial<PipelineInput>): Observable<TermsAcceptanceState> {
  const { web3Context$, version, jwtAuthSetupToken$, checkAcceptance$, saveAcceptance$ } =
    defaultParams

  if (!overrides) {
    return createTermsAcceptance$(
      web3Context$,
      version,
      jwtAuthSetupToken$,
      checkAcceptance$,
      saveAcceptance$,
    )
  }

  const args = mapValues(defaultParams, (v, k) => {
    return overrides[k as keyof PipelineInput] ? overrides[k as keyof PipelineInput] : v
  }) as PipelineInput

  return createTermsAcceptance$(
    args.web3Context$,
    args.version,
    args.jwtAuthSetupToken$,
    args.checkAcceptance$,
    args.saveAcceptance$,
  )
}

describe('termsAcceptance', () => {
  beforeEach(() => localStorage.clear())

  it('Wallet connection: connection in progress', () => {
    const state = getStateUnpacker(
      createState$({
        web3Context$: of({ status: 'connecting', connectionKind: 'injected' }),
      }),
    )
    expect(state().stage).toEqual('walletConnectionInProgress')
  })

  it('Wallet connection: wallet connected', () => {
    const state = getStateUnpacker(createState$())
    expect(state().stage).toEqual('jwtAuthWaiting4Acceptance')
  })

  it('Terms of Service: accepting ', () => {
    const state = getStateUnpacker(createState$())
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('jwtAuthInProgress')
  })

  it('Acceptance lookup: when signature exists locally, checks db', () => {
    localStorage.setItem('token-b/0x123', 'xxx')
    const state = getStateUnpacker(createState$({}))
    expect(state().stage).toEqual('acceptanceCheckInProgress')
  })

  it('Acceptance lookup: when a signature exists locally and matches db, end of flow', () => {
    localStorage.setItem('token-b/0x123', 'xxx')
    const state = getStateUnpacker(
      createState$({
        checkAcceptance$: () => of({ acceptance: true }),
        saveAcceptance$: () => new Observable<void>(),
      }),
    )
    expect(state().stage).toEqual('acceptanceAccepted')
  })

  it('Acceptance lookup: no signature exists in db', () => {
    localStorage.setItem('token-b/0x123', 'xxx')
    const state = getStateUnpacker(
      createState$({
        checkAcceptance$: () => of({ acceptance: false }),
        saveAcceptance$: () => new Observable<void>(),
        jwtAuthSetupToken$: () => of('xxx'),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('acceptanceWaiting4TOSAcceptance')
    expect(state().updated).toBeUndefined()
  })

  it('Acceptance lookup: signature exists in db but terms are updated', () => {
    localStorage.setItem('token-b/0x123', 'xxx')
    const state = getStateUnpacker(
      createState$({
        checkAcceptance$: () => of({ acceptance: false, updated: true }),
        saveAcceptance$: () => new Observable<void>(),
        jwtAuthSetupToken$: () => of('xxx'),
      }),
    )
    expect(state().stage).toEqual('acceptanceWaiting4TOSAcceptance')
    expect(state().updated).toEqual(true)
  })

  it('Acceptance authentication: rejecting signature wallet and try again', () => {
    const state = getStateUnpacker(createState$())
    ;(state() as any).rejectJwtAuth()
    expect(state().stage).toEqual('jwtAuthRejected')
    ;(state() as any).tryAgain()
    expect(state().stage).toEqual('jwtAuthWaiting4Acceptance')
  })

  it('Acceptance authentication: accepting triggers signature procedure', () => {
    const state = getStateUnpacker(createState$())
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('jwtAuthInProgress')
  })

  it('Acceptance signing: checking if signature exists after signing', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('acceptanceCheckInProgress')
  })

  it('Acceptance signing: signature throws error', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => throwError('error'),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('jwtAuthFailed')
  })

  it('Acceptance signing: checking db returned error after issuing JWT', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
        checkAcceptance$: () => throwError('error'),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    expect(state().stage).toEqual('acceptanceCheckFailed')
  })

  it('Acceptance signing: checking db returned error with existing JWT', () => {
    localStorage.setItem('token-b/0x123', 'xxx')
    const state = getStateUnpacker(
      createState$({
        checkAcceptance$: () => throwError('error'),
      }),
    )

    expect(state().stage).toEqual('acceptanceCheckFailed')
  })

  it('Acceptance signing: saving to db returned error', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
        checkAcceptance$: () => of({ acceptance: false }),
        saveAcceptance$: () => throwError('error'),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    ;(state() as any).acceptTOS()

    expect(state().stage).toEqual('acceptanceSaveFailed')
  })

  it('Acceptance signing: signature does not exist, saving to db', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
        checkAcceptance$: () => of({ acceptance: false }),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    ;(state() as any).acceptTOS()

    expect(state().stage).toEqual('acceptanceSaveInProgress')
  })

  it('Acceptance signing: signature already exists', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
        checkAcceptance$: () => of({ acceptance: true }),
      }),
    )
    ;(state() as any).acceptJwtAuth()

    expect(state().stage).toEqual('acceptanceAccepted')
  })

  it('Acceptance signing: successfully saved signature to db', () => {
    const state = getStateUnpacker(
      createState$({
        jwtAuthSetupToken$: () => of('xxx'),
        checkAcceptance$: () => of({ acceptance: false }),
        saveAcceptance$: () => of(undefined),
      }),
    )
    ;(state() as any).acceptJwtAuth()
    ;(state() as any).acceptTOS()

    expect(state().stage).toEqual('acceptanceAccepted')
  })
})
