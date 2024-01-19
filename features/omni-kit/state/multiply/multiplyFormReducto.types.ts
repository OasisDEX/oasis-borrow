import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateGenerate,
  FormActionsUpdateGenerateMax,
  FormActionsUpdatePayback,
  FormActionsUpdatePaybackMax,
  FormActionsUpdateWithdraw,
  FormActionsUpdateWithdrawMax,
  UpdateLoanToValue,
} from 'features/omni-kit/state'
import type {
  OmniCloseTo,
  OmniMultiplyFormAction,
  OmniMultiplyPanel,
  OmniProductType,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniMultiplyFormState {
  productType: OmniProductType.Multiply
  action?: OmniMultiplyFormAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  generateAmountMax?: boolean
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  paybackAmountMax: boolean
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  withdrawAmountMax: boolean
  loanToValue?: BigNumber
  closeTo: OmniCloseTo
  uiDropdown: OmniMultiplyPanel
  uiPill: Exclude<
    OmniMultiplyFormAction,
    | OmniMultiplyFormAction.AdjustMultiply
    | OmniMultiplyFormAction.OpenMultiply
    | OmniMultiplyFormAction.SwitchMultiply
    | OmniMultiplyFormAction.CloseMultiply
  >
}

export type OmniMultiplyFormActions = ReductoActions<
  OmniMultiplyFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateGenerate
  | FormActionsUpdateGenerateMax
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateWithdrawMax
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
