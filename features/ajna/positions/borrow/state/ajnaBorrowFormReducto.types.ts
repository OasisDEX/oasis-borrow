import type BigNumber from 'bignumber.js'
import type { AjnaBorrowPanel } from 'features/ajna/common/types/AjnaPanel.types'
import type {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateGenerate,
  AjnaFormActionsUpdatePayback,
  AjnaFormActionsUpdatePaybackMax,
  AjnaFormActionsUpdateWithdraw,
  AjnaUpdateLoanToValue,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import type { ProtocolBorrowAction, ProtocolPositionCloseTo } from 'features/unifiedProtocol/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
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
  uiDropdown: AjnaBorrowPanel
  uiPill: Exclude<ProtocolBorrowAction, 'open-borrow'>
}

export type AjnaBorrowFormAction = ReductoActions<
  AjnaBorrowFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateGenerate
  | AjnaFormActionsUpdatePayback
  | AjnaFormActionsUpdatePaybackMax
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
  | AjnaUpdateLoanToValue
>
