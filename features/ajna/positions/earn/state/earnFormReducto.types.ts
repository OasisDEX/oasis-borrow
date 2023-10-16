import type BigNumber from 'bignumber.js'
import type { earnPanel } from 'features/ajna/common/types/AjnaPanel.types'
import type {
  FormActionsReset,
  FormActionsUpdateDeposit,
  FormActionsUpdateDpm,
  FormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/formReductoActions'
import type { ProtocolEarnAction } from 'features/unifiedProtocol/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface EarnFormState {
  action?: ProtocolEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  price?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: earnPanel
  uiPill: Exclude<ProtocolEarnAction, 'open-earn' | 'claim-earn'>
}

export type EarnFormAction = ReductoActions<
  EarnFormState,
  | FormActionsUpdateDeposit
  | FormActionsUpdateWithdraw
  | FormActionsUpdateDpm
  | FormActionsReset
>
