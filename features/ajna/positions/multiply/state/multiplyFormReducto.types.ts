import type BigNumber from 'bignumber.js'
import type { multiplyPanel } from 'features/ajna/common/types/AjnaPanel.types'
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
import type {
  ProtocolMultiplyAction,
  ProtocolPositionCloseTo,
} from 'features/unifiedProtocol/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface MultiplyFormState {
  action?: ProtocolMultiplyAction
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
  uiDropdown: multiplyPanel
  uiPill: Exclude<
    ProtocolMultiplyAction,
    'adjust' | 'open-multiply' | 'switch-multiply' | 'close-multiply'
  >
}

export type MultiplyFormAction = ReductoActions<
  MultiplyFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateGenerate
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
