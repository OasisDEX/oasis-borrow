import type BigNumber from 'bignumber.js'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateWithdraw,
} from 'features/omni-kit/common/state/omniFormReductoActions'
import type { OmniEarnAction, OmniEarnPanel } from 'features/omni-kit/types/common.types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniEarnFormState {
  action?: OmniEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: OmniEarnPanel
  uiPill: Exclude<OmniEarnAction, 'open-earn' | 'claim-earn'>
}

export type OmniEarnFormAction = ReductoActions<
  OmniEarnFormState,
  FormActionsUpdateDeposit | FormActionsUpdateWithdraw | FormActionsUpdateDpm | FormActionsReset
>
