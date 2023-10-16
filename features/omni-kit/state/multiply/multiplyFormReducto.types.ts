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
  OmniCloseTo,
  OmniMultiplyAction,
  OmniMultiplyPanel,
} from 'features/omni-kit/types/common.types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniMultiplyFormState {
  action?: OmniMultiplyAction
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
  uiDropdown: OmniMultiplyPanel
  uiPill: Exclude<
    OmniMultiplyAction,
    'adjust' | 'open-multiply' | 'switch-multiply' | 'close-multiply'
  >
}

export type OmniMultiplyFormAction = ReductoActions<
  OmniMultiplyFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateGenerate
  | FormActionsUpdatePayback
  | FormActionsUpdatePaybackMax
  | FormActionsUpdateWithdraw
  | FormActionsUpdateDpm
  | FormActionsReset
  | UpdateLoanToValue
>
