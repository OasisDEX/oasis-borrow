import { BigNumber } from 'bignumber.js'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'
import { EnvironmentState } from './enviroment'

export type EditingStage = 'editing'
type DepositChange = { kind: 'depositAmount'; depositAmount?: BigNumber }
type DepositMaxChange = { kind: 'depositMaxAmount'; depositAmount?: BigNumber }

type StageProgressChange = { kind: 'progressEditing' }

type BackToEditingChange = { kind: 'backToEditing' }

export type FormChanges =
  | DepositChange
  | DepositMaxChange
  | StageProgressChange
  | BackToEditingChange
export interface FormState {
  depositAmount?: BigNumber
}

export interface FormFunctions {
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositMax?: () => void
  progress?: () => void
}

type StateDependencies = {
  balanceInfo: BalanceInfo
  proxyAddress?: string
  allowance?: BigNumber
  errorMessages: string[]
}

export function applyFormChange<S extends FormState & StateDependencies, Ch extends FormChanges>(
  state: S,
  change: Ch,
): S {
  switch (change.kind) {
    case 'depositAmount':
      return {
        ...state,
        depositAmount: change.depositAmount,
      }
    case 'depositMaxAmount':
      return {
        ...state,
        depositAmount: state.balanceInfo.daiBalance,
      }
    case 'progressEditing':
      const { allowance, errorMessages, proxyAddress, depositAmount } = state
      const preventProgress = errorMessages.length > 0
      const fieldEmptyOrZero = depositAmount === undefined || depositAmount.eq(zero)

      if (preventProgress || fieldEmptyOrZero) {
        return state
      }

      const hasProxy = !!proxyAddress

      if (!hasProxy) {
        return {
          ...state,
          stage: 'proxyWaitingForConfirmation',
        }
      }

      const depositAmountLessThenAllowance =
        !!allowance && !!depositAmount && allowance.gte(depositAmount)

      if (depositAmountLessThenAllowance) {
        return {
          ...state,
          stage: 'allowanceWaitingForConfirmation',
        }
      }

      return {
        ...state,
        stage: 'txWaitingForConfirmation',
      }
    case 'backToEditing':
      return {
        ...state,
        stage: 'editing',
      }
    default:
      return state
  }
}
export function addFormTransitions<
  S extends FormFunctions & EnvironmentState & { stage: string /* TODO make it precise */ }
>(state: S, change: (ch: any /* TODO make it precise */) => void): S {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) =>
        change({ kind: 'depositAmount', depositAmount }),
      updateDepositMax: () => change({ kind: 'depositMaxAmount' }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  return state
}

export const defaultFormState: FormState = {
  depositAmount: undefined,
}
