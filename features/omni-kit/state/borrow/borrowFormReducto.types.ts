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
  OmniBorrowFormAction,
  OmniCloseTo,
  OmniProductType,
  OmniSidebarBorrowPanel,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniBorrowFormState {
  productType: OmniProductType.Borrow
  action?: OmniBorrowFormAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  generateAmountMax: boolean
  generateAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  paybackAmountMax: boolean
  withdrawAmount?: BigNumber
  withdrawAmountMax: boolean
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
  | FormActionsUpdateGenerateMax
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateWithdrawMax
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
