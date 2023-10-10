import type BigNumber from 'bignumber.js'
import type { AjnaEarnAction } from 'features/ajna/common/types/AjnaAction.types'
import type { AjnaEarnPanel } from 'features/ajna/common/types/AjnaPanel.types'
import type {
  AjnaFormActionsReset,
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateDpm,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import type { ReductoActions } from 'helpers/useReducto'

export interface AjnaEarnFormState {
  action?: AjnaEarnAction
  dpmAddress: string
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  price?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  uiDropdown: AjnaEarnPanel
  uiPill: Exclude<AjnaEarnAction, 'open-earn' | 'claim-earn'>
}

export type AjnaEarnFormAction = ReductoActions<
  AjnaEarnFormState,
  | AjnaFormActionsUpdateDeposit
  | AjnaFormActionsUpdateWithdraw
  | AjnaFormActionsUpdateDpm
  | AjnaFormActionsReset
>
