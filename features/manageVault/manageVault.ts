import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

const defaultIsStates = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isDaiAllowanceStage: false,
  isTransactionStage: false,
}

function applyIsStageStates(state: ManageVaultState): ManageVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'editing':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...newState,
        isCollateralAllowanceStage: true,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...newState,
        isDaiAllowanceStage: true,
      }

    case 'transactionWaitingForConfirmation':
    case 'transactionWaitingForApproval':
    case 'transactionInProgress':
    case 'transactionFailure':
    case 'transactionSuccess':
      return {
        ...newState,
        isTransactionStage: true,
      }
    default:
      return state
  }
}

export type ManageVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'collateralAllowanceWaitingForConfirmation'
  | 'collateralAllowanceWaitingForApproval'
  | 'collateralAllowanceInProgress'
  | 'collateralAllowanceFailure'
  | 'collateralAllowanceSuccess'
  | 'daiAllowanceWaitingForConfirmation'
  | 'daiAllowanceWaitingForApproval'
  | 'daiAllowanceInProgress'
  | 'daiAllowanceFailure'
  | 'daiAllowanceSuccess'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFailure'
  | 'transactionSuccess'

export interface ManageVaultState {
  stage: ManageVaultStage
  id: BigNumber
  ilk: string
  token: string
  account: string

  // IsStage states
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isTransactionStage: boolean

  reset?: () => void
}

export function createManageVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<ManageVaultState> {
  return combineLatest(context$, txHelpers$, vault$(id)).pipe(
    switchMap(([context, txHelpers, { token, ilk }]) => {
      const account = context.account
      return of({
        account,
        id,
        stage: 'editing',
        token,
        ilk,
      })
    }),
    map(applyIsStageStates),
  )
}
