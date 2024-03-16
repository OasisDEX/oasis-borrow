import type BigNumber from 'bignumber.js'
import type { FormActionsReset } from 'features/omni-kit/state'
import type {
  AutomationFormActionsUpdateAction,
  AutomationFormActionsUpdateMaxGasFee,
  AutomationFormActionsUpdatePrice,
  AutomationFormActionsUpdateTargetLtv,
  AutomationFormActionsUpdateTriggerLtv,
  AutomationFormActionsUpdateUseThreshold,
} from 'features/omni-kit/state/automation/common'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationAutoBSFormState {
  targetLtv?: BigNumber
  triggerLtv?: BigNumber
  price?: BigNumber
  maxGasFee?: BigNumber
  useThreshold: boolean
  action: TriggerAction
}

export type OmniAutomationAutoBSFormActions = ReductoActions<
  OmniAutomationAutoBSFormState,
  | AutomationFormActionsUpdateTargetLtv
  | AutomationFormActionsUpdateTriggerLtv
  | AutomationFormActionsUpdatePrice
  | AutomationFormActionsUpdateMaxGasFee
  | AutomationFormActionsUpdateUseThreshold
  | AutomationFormActionsUpdateAction
  | FormActionsReset
>
