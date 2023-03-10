// TODO REMOVE NO CHECK
// @ts-nocheck
import { BigNumber } from 'bignumber.js'
import { TxHelpers } from 'components/AppContext'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

import { defaultAllowanceState } from '../../../../allowance/allowance'
import { defaultProxyStage } from '../../../../proxy/proxy'
import { EnvironmentState } from './enviroment'
import { openGuniVault, TxStateDependencies } from './guniActionsCalls'
import { defaultGuniOpenMultiplyVaultConditions } from './openGuniVaultConditions'

export type EditingStage = 'editing'
export type DepositChange = { kind: 'depositAmount'; depositAmount?: BigNumber }
export type DepositMaxChange = { kind: 'depositMaxAmount'; depositAmount?: BigNumber }

type StageProgressChange = { kind: 'progressEditing' }

type BackToEditingChange = { kind: 'backToEditing' }

export type FormChanges =
  | DepositChange
  | DepositMaxChange
  | StageProgressChange
  | BackToEditingChange
  | { kind: 'clear' } // TODO remove, added just to avoid ts issues

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
    case 'depositMaxAmount':
      return {
        ...state,
        depositAmount: change.depositAmount,
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

      const allowanceToSmall = !!allowance && !!depositAmount && depositAmount.gt(allowance)

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
      // TODO: move it to a separate file
      if (change.kind === 'txWaitingForApproval') {
        return {
          ...state,
          stage: 'txWaitingForApproval',
        }
      }

      if (change.kind === 'txInProgress') {
        const { openTxHash } = change
        return {
          ...state,
          openTxHash,
          stage: 'txInProgress',
        }
      }

      if (change.kind === 'txFailure') {
        const { txError } = change
        return {
          ...state,
          stage: 'txFailure',
          txError,
        }
      }

      if (change.kind === 'txSuccess') {
        return { ...state, stage: 'txSuccess', id: change.id }
      }

      if (change.kind === 'clear') {
        return {
          ...state,
          ...defaultFormState,
          ...defaultAllowanceState,
          ...defaultProxyStage,
          ...defaultGuniOpenMultiplyVaultConditions,
          depositAmount: undefined,
          depositAmountUSD: undefined,
          afterOutstandingDebt: undefined,
        }
      }

      return state
  }
}
export function addFormTransitions<
  S extends FormFunctions &
    EnvironmentState &
    TxStateDependencies & { stage: string /* TODO make it precise */ }
>(txHelpers: TxHelpers, change: (ch: any /* TODO make it precise */) => void, state: S): S {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) =>
        change({ kind: 'depositAmount', depositAmount }),
      updateDepositMax: () =>
        change({ kind: 'depositMaxAmount', depositAmount: state.balanceInfo.daiBalance }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'txWaitingForConfirmation' || state.stage === 'txFailure') {
    return {
      ...state,
      progress: () => openGuniVault(txHelpers, change, state),
      regress: () => change({ kind: 'backToEditing' }),
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
