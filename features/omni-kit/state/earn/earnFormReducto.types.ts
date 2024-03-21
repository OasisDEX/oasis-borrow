import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateSwapToken,
  FormActionsUpdateWithdraw,
  FormActionsUpdateWithdrawMax,
} from 'features/omni-kit/state'
import type {
  OmniEarnFormAction,
  OmniProductType,
  OmniSidebarEarnPanel,
  OmniSwapToken,
} from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniEarnFormState {
  productType: OmniProductType.Earn
  action?: OmniEarnFormAction
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  dpmAddress: string
  pullToken?: OmniSwapToken
  returnToken?: OmniSwapToken
  uiDropdown: OmniSidebarEarnPanel
  uiPill: Exclude<OmniEarnFormAction, OmniEarnFormAction.OpenEarn | OmniEarnFormAction.ClaimEarn>
  withdrawAmount?: BigNumber
  withdrawAmountMax: boolean
  withdrawAmountUSD?: BigNumber
}

export type OmniEarnFormActions = ReductoActions<
  OmniEarnFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateWithdraw
  | FormActionsUpdateWithdrawMax
  | FormActionsUpdateSwapToken
  | FormActionsUpdateDpm
  | FormActionsReset
>
