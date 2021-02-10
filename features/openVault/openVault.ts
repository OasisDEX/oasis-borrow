import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context, ContextConnected, ContextConnectedReadOnly } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { Change, Changes } from 'helpers/form'
import { combineLatest, Observable, of, iif, EMPTY } from 'rxjs'
import { mergeMap, startWith, switchMap } from 'rxjs/operators'

interface PersistentOpenVaultState {
  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
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
  isProxyStage: false
  isAllowanceStage: false
}

function createIlkValidation$(
  ilks$: Observable<string[]>,
  ilk: string,
): Observable<IlkValidationState> {
  const initialState = {
    ilk,
    isIlkValidationStage: true,
    isEditingStage: false,
    isProxyStage: false,
    isAllowanceStage: false,
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

interface EditingPersistentState extends PersistentOpenVaultState {
  stage: EditingStage
  isIlkValidationStage: false
  isEditingStage: true
  isProxyStage: false
  isAllowanceStage: false
  token: string
}

interface EditingStateReadonly extends EditingPersistentState {
  stage: 'editingReadonly'
}

interface EditingStateConnected extends EditingPersistentState {
  stage: 'editingConnected'
  account: string
}

export type EditingState = EditingStateReadonly | EditingStateConnected

type ProxyStage =
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxyWaitToContinue'

interface ProxyPersistentState extends PersistentOpenVaultState {
  stage: ProxyStage
  isIlkValidationStage: false
  isEditingStage: false
  isProxyStage: true
  isAllowanceStage: false
  proxyIsLoading: boolean
  account: string
}

interface ProxyConfirmationState extends ProxyPersistentState {
  stage: 'proxyWaitingForConfirmation'
  proxyIsLoading: false
  createProxy: () => void
}

interface ProxyFailureState extends ProxyPersistentState {
  stage: 'proxyWaitingForConfirmation'
  proxyIsLoading: false
  retry: () => void
}

interface ProxyContinueState extends ProxyPersistentState {
  stage: 'proxyWaitToContinue'
  proxyIsLoading: false
  continue: () => void
}

interface ProxyLoadingState extends ProxyPersistentState {
  stage: 'proxyWaitingForApproval' | 'proxyInProgress'
  proxyIsLoading: true
}

type ProxyState =
  | ProxyConfirmationState
  | ProxyFailureState
  | ProxyContinueState
  | ProxyLoadingState

type AllowanceStage =
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceWaitToContinue'

interface AllowancePersistentState extends PersistentOpenVaultState {
  stage: AllowanceStage
  isIlkValidationStage: false
  isEditingStage: false
  isProxyStage: false
  isAllowanceStage: true
  allowanceIsLoading: boolean
  account: string
}

interface AllowanceConfirmationState extends AllowancePersistentState {
  stage: 'allowanceWaitingForConfirmation'
  allowanceIsLoading: false
  setAllowance: () => void
}

interface AllowanceFailureState extends AllowancePersistentState {
  stage: 'allowanceWaitingForConfirmation'
  allowanceIsLoading: false
  retry: () => void
}

interface AllowanceContinueState extends AllowancePersistentState {
  stage: 'allowanceWaitToContinue'
  allowanceIsLoading: false
  continue: () => void
}

interface AllowanceLoadingState extends AllowancePersistentState {
  stage: 'allowanceWaitingForApproval' | 'allowanceInProgress'
  allowanceIsLoading: true
}

type AllowanceState =
  | AllowanceConfirmationState
  | AllowanceFailureState
  | AllowanceContinueState
  | AllowanceLoadingState

type OpenStage =
  | 'openWaitingForConfirmation'
  | 'openWaitingForApproval'
  | 'openInProgress'
  | 'openFailure'
  | 'openWaitToContinue'

interface OpenPersistentState extends PersistentOpenVaultState {
  stage: OpenStage
  isIlkValidationStage: false
  isEditingStage: false
  isProxyStage: false
  isOpenStage: true
  openIsLoading: boolean
  account: string
}

interface OpenConfirmationState extends OpenPersistentState {
  stage: 'openWaitingForConfirmation'
  openIsLoading: false
  setOpen: () => void
}

interface OpenFailureState extends OpenPersistentState {
  stage: 'openWaitingForConfirmation'
  openIsLoading: false
  retry: () => void
}

interface OpenContinueState extends OpenPersistentState {
  stage: 'openWaitToContinue'
  openIsLoading: false
  continue: () => void
}

interface OpenLoadingState extends OpenPersistentState {
  stage: 'openWaitingForApproval' | 'openInProgress'
  openIsLoading: true
}

type OpenState = OpenConfirmationState | OpenFailureState | OpenContinueState | OpenLoadingState

export type OpenVaultStage =
  | IlkValidationStage
  | EditingStage
  | ProxyStage
  | AllowanceStage
  | OpenStage

export type OpenVaultState =
  | IlkValidationState
  | EditingState
  | ProxyState
  | AllowanceState
  | OpenState

type OpenVaultChange = Changes<OpenVaultState>

// export type ManualChange =
//   | Change<OpenVaultState, 'lockAmount'>
//   | Change<OpenVaultState, 'drawAmount'>
//   | Change<OpenVaultState, 'maxDrawAmount'>

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
