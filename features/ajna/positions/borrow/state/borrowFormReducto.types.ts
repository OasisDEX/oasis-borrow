import type BigNumber from 'bignumber.js'
import type { BorrowPanel } from 'features/ajna/common/types/AjnaPanel.types'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateGenerate,
  FormActionsUpdatePayback,
  FormActionsUpdatePaybackMax,
  FormActionsUpdateWithdraw,
  UpdateLoanToValue,
} from 'features/ajna/positions/common/state/formReductoActions'
import type { ProtocolBorrowAction, ProtocolPositionCloseTo } from 'features/unifiedProtocol/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface BorrowFormState {
  action?: ProtocolBorrowAction
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
  closeTo: ProtocolPositionCloseTo
  uiDropdown: BorrowPanel
  uiPill: Exclude<ProtocolBorrowAction, 'open-borrow'>
}

export type BorrowFormAction = ReductoActions<
  BorrowFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateGenerate
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
