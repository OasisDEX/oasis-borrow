import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateWithdraw,
} from 'features/omni-kit/state'
import type { OmniEarnFormAction, OmniEarnPanel } from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniEarnFormState {
  action?: OmniEarnFormAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: OmniEarnPanel
  uiPill: Exclude<OmniEarnFormAction, OmniEarnFormAction.OpenEarn | OmniEarnFormAction.ClaimEarn>
}

export type OmniEarnFormActions = ReductoActions<
  OmniEarnFormState,
  FormActionsUpdateDeposit | FormActionsUpdateWithdraw | FormActionsUpdateDpm | FormActionsReset
>
