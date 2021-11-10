import { BigNumber } from 'bignumber.js'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'
import { EnvironmentState } from './enviroment'

export type EditingStage = 'editing'
export type DepositChange = { kind: 'depositAmount'; depositAmount?: BigNumber }
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
  isEditingStage: boolean
}

export const defaultFormState: FormState = {
  depositAmount: undefined,
  isEditingStage: false,
}

export const EDITING_STAGES = ['editing'] as const

export function isEditingStage(stage: string): stage is EditingStage {
  return EDITING_STAGES.includes(stage as any)
}

export function applyIsEditingStage<S extends { stage: string }>(state: S): S {
  return {
    ...state,
    isEditingStage: isEditingStage(state.stage),
  }
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

      const allowanceToSmall = !!allowance && !!depositAmount && depositAmount.gte(allowance)

      if (allowanceToSmall) {
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
>(change: (ch: any /* TODO make it precise */) => void, state: S): S {
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

// interface FormValidationState {
//   inputAmountsEmpty: boolean
//   depositingAllDaiBalance: boolean
//   depositAmountExceedsDaiBalance: boolean
//   // generateAmountExceedsDebtCeiling: boolean // TODO: maybe in different place
//   // generateAmountLessThanDebtFloor: boolean // TODO: maybe in different place
// }
// export function applyFormValidation<
//   S extends FormState & StateDependencies & { stage: string /* TODO make it precise */ }
// >(state: S) {
//   const {
//     balanceInfo: { daiBalance },
//     depositAmount,
//     stage,
//   } = state
//   console.log(stage)
//   if (stage === 'editing') {
//     return {
//       ...state,
//       inputAmountsEmpty: !depositAmount,
//       depositingAllDaiBalance: daiBalance === depositAmount,
//       depositAmountExceedsDaiBalance: depositAmount ? depositAmount > daiBalance : false,
//     }
//   }
//
//   return state
// }
