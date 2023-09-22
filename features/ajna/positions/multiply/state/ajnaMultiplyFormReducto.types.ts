import type BigNumber from 'bignumber.js'
import type { AjnaCloseTo } from 'features/ajna/common/types'
import type { AjnaMultiplyAction } from 'features/ajna/common/types/AjnaAction.types'
import type { AjnaMultiplyPanel } from 'features/ajna/common/types/AjnaPanel.types'
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

export interface AjnaMultiplyFormState {
  action?: AjnaMultiplyAction
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
  uiDropdown: AjnaMultiplyPanel
  uiPill: Exclude<
    AjnaMultiplyAction,
    'adjust' | 'open-multiply' | 'switch-multiply' | 'close-multiply'
  >
}

export type AjnaMultiplyFormAction = ReductoActions<
  AjnaMultiplyFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateGenerate
  | AjnaFormActionsUpdatePayback
  | AjnaFormActionsUpdatePaybackMax
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
  | AjnaUpdateLoanToValue
>
