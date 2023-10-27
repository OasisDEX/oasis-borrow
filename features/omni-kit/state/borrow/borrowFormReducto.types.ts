import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateGenerate,
  FormActionsUpdatePayback,
  FormActionsUpdatePaybackMax,
  FormActionsUpdateWithdraw,
  UpdateLoanToValue,
} from 'features/omni-kit/state'
import type {
  OmniBorrowFormAction,
  OmniCloseTo,
  OmniSidebarBorrowPanel,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniBorrowFormState {
  action?: OmniBorrowFormAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  paybackAmountMax: boolean
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  loanToValue?: BigNumber
  closeTo: OmniCloseTo
  uiDropdown: OmniSidebarBorrowPanel
  uiPill: Exclude<OmniBorrowFormAction, OmniBorrowFormAction.OpenBorrow>
}

export type OmniBorrowFormActions = ReductoActions<
  OmniBorrowFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateGenerate
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
