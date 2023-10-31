import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateWithdraw,
} from 'features/omni-kit/state'
import type {
  OmniEarnFormAction,
  OmniProductType,
  OmniSidebarEarnPanel,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniEarnFormState {
  productType: OmniProductType.Earn
  action?: OmniEarnFormAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: OmniSidebarEarnPanel
  uiPill: Exclude<OmniEarnFormAction, OmniEarnFormAction.OpenEarn | OmniEarnFormAction.ClaimEarn>
}

export type OmniEarnFormActions = ReductoActions<
  OmniEarnFormState,
  FormActionsUpdateDeposit | FormActionsUpdateWithdraw | FormActionsUpdateDpm | FormActionsReset
>
