import type BigNumber from 'bignumber.js'
import type { FormActionsReset } from 'features/omni-kit/state'
import type {
  AutomationFormActionsUpdateAction,
  AutomationFormActionsUpdateTriggerLtv,
} from 'features/omni-kit/state/automation/common'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationStopLossFormState {
  triggerLtv?: BigNumber
  maxGasFee?: BigNumber
  resolveTo: OmniCloseTo
  action: TriggerAction
}

export type OmniAutomationStopLossFormActions = ReductoActions<
  OmniAutomationStopLossFormState,
  AutomationFormActionsUpdateTriggerLtv | AutomationFormActionsUpdateAction | FormActionsReset
>
