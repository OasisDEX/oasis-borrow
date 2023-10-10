import type BigNumber from 'bignumber.js'
import type { AjnaCloseTo } from 'features/ajna/common/types'
import type { AjnaBorrowAction } from 'features/ajna/common/types/AjnaAction.types'
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
import type { ReductoActions } from 'helpers/useReducto'

export interface AjnaBorrowFormState {
  action?: AjnaBorrowAction
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
  closeTo: AjnaCloseTo
  uiDropdown: AjnaBorrowPanel
  uiPill: Exclude<AjnaBorrowAction, 'open-borrow'>
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
