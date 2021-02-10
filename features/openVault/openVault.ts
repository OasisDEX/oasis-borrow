import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context, ContextConnected, ContextConnectedReadOnly } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { combineLatest, Observable, of, iif, EMPTY } from 'rxjs'
import { mergeMap, startWith, switchMap } from 'rxjs/operators'

interface PersistentOpenVaultState {
  isIlkValidationStage: boolean
  isEditingStage: boolean
  ilk: string
}

export type IlkValidationStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'

export interface IlkValidationState extends PersistentOpenVaultState {
  stage: IlkValidationStage
  isIlkValidationStage: true
  isEditingStage: false
}

function createIlkValidation$(
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<IlkValidationState> {
  const initialState = {
    ilk,
    isIlkValidationStage: true,
    isEditingStage: false,
    stage: 'ilkValidationLoading',
  } as IlkValidationState

  return ilks$.pipe(
    switchMap((ilks) => {
      const isValidIlk = ilks.some((i) => i === ilk)
      if (!isValidIlk) {
        return of({
          ...initialState,
          stage: 'ilkValidationFailure',
        })
      }
      return of({
        ...initialState,
        stage: 'ilkValidationSuccess',
      })
    }),
    startWith(initialState),
  )
}

type EditingStage = 'editingReadonly' | 'editingConnected'

export interface EditingPersistentState extends PersistentOpenVaultState {
  stage: EditingStage
  isIlkValidationStage: false
  isEditingStage: true
  token: string
}

export interface EditingStateReadonly extends EditingPersistentState {
  stage: 'editingReadonly'
}

export interface EditingStateConnected extends EditingPersistentState {
  stage: 'editingConnected'
  account: string
}

export type EditingState = EditingStateReadonly | EditingStateConnected

export type OpenVaultStage =
  | IlkValidationStage
  | EditingStage
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'waitToContinue'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFailure'
  | 'transactionSuccess'

export type OpenVaultState = IlkValidationState | EditingState

// We still want people who haven't connected a wallet to be able simulate
// the opening a vault. This pipeline is for managing that context. On UI side
// it should offer a redirect to the connect page
//
// Also this is unreachable as it is dependent on the ilks$ which does not work
// in the current readonly context we have taken from casual
function createOpenVaultReadonly$(
  context: ContextConnectedReadOnly,
  ilk: string,
  token: string,
): Observable<EditingStateReadonly> {
  return of({
    stage: 'editingReadonly',
    isIlkValidationStage: false,
    isEditingStage: true,
    token,
    ilk,
  })
}

function createOpenVaultConnected$(
  context: ContextConnected,
  ilk: string,
  token: string,
): Observable<EditingStateConnected> {
  return of({
    stage: 'editingConnected',
    isIlkValidationStage: false,
    isEditingStage: true,
    token,
    ilk,
    account: context.account,
  })
}

export function createOpenVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<OpenVaultState> {
  return createIlkValidation$(ilks$, ilk).pipe(
    mergeMap((state) =>
      iif(
        () => state.stage !== 'ilkValidationSuccess',
        of(state),
        context$.pipe(
          mergeMap((context) => {
            const token = ilk.split('-')[0]
            return iif(
              () => context.status === 'connectedReadonly',
              createOpenVaultReadonly$(context as ContextConnectedReadOnly, ilk, token),
              createOpenVaultConnected$(context as ContextConnected, ilk, token),
            )
          }),
        ),
      ),
    ),
  )
}
