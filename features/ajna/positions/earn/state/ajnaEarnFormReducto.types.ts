import type BigNumber from 'bignumber.js'
import type { AjnaEarnPanel } from 'features/ajna/common/types/AjnaPanel.types'
import type {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import type { ProtocolEarnAction } from 'features/unifiedProtocol/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface AjnaEarnFormState {
  action?: ProtocolEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  price?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: AjnaEarnPanel
  uiPill: Exclude<ProtocolEarnAction, 'open-earn' | 'claim-earn'>
}

export type AjnaEarnFormAction = ReductoActions<
  AjnaEarnFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
>
