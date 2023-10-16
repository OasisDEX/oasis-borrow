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
} from 'features/omni-kit/common/state/omniFormReductoActions'
import type {
  OmniBorrowAction,
  OmniBorrowPanel,
  OmniCloseTo,
} from 'features/omni-kit/types/common.types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniBorrowFormState {
  action?: OmniBorrowAction
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
  uiDropdown: OmniBorrowPanel
  uiPill: Exclude<OmniBorrowAction, 'open-borrow'>
}

export type OmniBorrowFormAction = ReductoActions<
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
