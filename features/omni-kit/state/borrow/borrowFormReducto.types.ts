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
  OmniBorrowFormAction,
  OmniCloseTo,
  OmniProductType,
  OmniSidebarBorrowPanel,
  OmniSwapToken,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniBorrowFormState {
  productType: OmniProductType.Borrow
  action?: OmniBorrowFormAction
  closeTo: OmniCloseTo
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  dpmAddress: string
  generateAmount?: BigNumber
  generateAmountMax: boolean
  generateAmountUSD?: BigNumber
  loanToValue?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountMax: boolean
  paybackAmountUSD?: BigNumber
  pullToken?: OmniSwapToken
  returnToken?: OmniSwapToken
  uiDropdown: OmniSidebarBorrowPanel
  uiPill: Exclude<OmniBorrowFormAction, OmniBorrowFormAction.OpenBorrow>
  withdrawAmount?: BigNumber
  withdrawAmountMax: boolean
  withdrawAmountUSD?: BigNumber
}

export type OmniBorrowFormActions = ReductoActions<
  OmniBorrowFormState,
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
