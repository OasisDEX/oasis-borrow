import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateGenerate,
  FormActionsUpdateGenerateMax,
  FormActionsUpdateLoanToValue,
  FormActionsUpdatePayback,
  FormActionsUpdatePaybackMax,
  FormActionsUpdateSwapToken,
  FormActionsUpdateWithdraw,
  FormActionsUpdateWithdrawMax,
} from 'features/omni-kit/state'
import type {
  OmniCloseTo,
  OmniMultiplyFormAction,
  OmniMultiplyPanel,
  OmniProductType,
  OmniSwapToken,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniMultiplyFormState {
  productType: OmniProductType.Multiply
  action?: OmniMultiplyFormAction
  closeTo: OmniCloseTo
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  dpmAddress: string
  generateAmount?: BigNumber
  generateAmountMax?: boolean
  generateAmountUSD?: BigNumber
  loanToValue?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountMax: boolean
  paybackAmountUSD?: BigNumber
  pullToken?: OmniSwapToken
  returnToken?: OmniSwapToken
  uiDropdown: OmniMultiplyPanel
  withdrawAmount?: BigNumber
  withdrawAmountMax: boolean
  withdrawAmountUSD?: BigNumber
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
  | FormActionsUpdateLoanToValue
  | FormActionsUpdateSwapToken
  | FormActionsUpdateDpm
  | FormActionsReset
>
