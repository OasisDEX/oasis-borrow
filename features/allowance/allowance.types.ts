import type { BigNumber } from 'bignumber.js'
import type { TxError } from 'helpers/types'

export const ALLOWANCE_STAGES = [
  'allowanceWaitingForConfirmation',
  'allowanceWaitingForApproval',
  'allowanceInProgress',
  'allowanceFailure',
  'allowanceSuccess',
] as const

// TODO: there is inconsistency between open/manage
// in open there is just one allowance called allowance
// in manage there are two allowances called daiAllowance and collateralAllowance

export enum AllowanceOption {
  UNLIMITED = 'unlimited',
  DEPOSIT_AMOUNT = 'depositAmount',
  CUSTOM = 'custom',
}
export type AllowanceChanges =
  | { kind: 'allowanceWaitingForApproval' }
  | {
      kind: 'allowanceInProgress'
      allowanceTxHash: string
    }
  | {
      kind: 'allowanceFailure'
      txError?: TxError
    }
  | {
      kind: 'allowanceSuccess'
      allowance: BigNumber
    }
  | {
      kind: 'allowance'
      allowanceAmount?: BigNumber
    }
  | { kind: 'allowanceUnlimited' }
  | {
      kind: 'allowanceAsDepositAmount'
    }
  | {
      kind: 'allowanceCustom'
    }
  | { kind: 'regressAllowance' }
  | {
      kind: 'backToEditing'
    }

export type AllowanceStages = (typeof ALLOWANCE_STAGES)[number]
export interface AllowanceState {
  selectedAllowanceRadio: AllowanceOption
  allowanceAmount?: BigNumber
  allowanceTxHash?: string
  txError?: TxError
  allowance?: BigNumber
  isAllowanceStage: boolean
}

export interface AllowanceFunctions {
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  progress?: () => void
  regress?: () => void
}

export interface StateDependencies {
  stage: string // TODO fix stages
  token: string

  // TODO: check if switching account this proxy changes
  proxyAddress?: string
  allowanceAmount?: BigNumber
  depositAmount?: BigNumber
}

export interface AllowanceConditions {
  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean
}
