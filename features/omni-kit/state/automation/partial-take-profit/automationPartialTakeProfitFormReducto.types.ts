import type BigNumber from 'bignumber.js'
import type { FormActionsReset } from 'features/omni-kit/state'
import type {
  AutomationFormActionsUpdateAction,
  AutomationFormActionsUpdateExtraTriggerLtv,
  AutomationFormActionsUpdateLtvStep,
  AutomationFormActionsUpdatePercentageOffset,
  AutomationFormActionsUpdatePrice,
  AutomationFormActionsUpdateTargetLtv,
  AutomationFormActionsUpdateTriggerLtv,
} from 'features/omni-kit/state/automation/common'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationPartialTakeProfitFormState {
  targetLtv?: BigNumber
  triggerLtv?: BigNumber
  extraTriggerLtv?: BigNumber
  trailingDistance?: BigNumber
  price?: BigNumber
  ltvStep?: BigNumber
  percentageOffset?: BigNumber
  resolveTo: OmniCloseTo
  action: TriggerAction
}

export type OmniAutomationPartialTakeProfitFormActions = ReductoActions<
  OmniAutomationPartialTakeProfitFormState,
  | AutomationFormActionsUpdateTargetLtv
  | AutomationFormActionsUpdateTriggerLtv
  | AutomationFormActionsUpdateExtraTriggerLtv
  | AutomationFormActionsUpdatePrice
  | AutomationFormActionsUpdateLtvStep
  | AutomationFormActionsUpdatePercentageOffset
  | AutomationFormActionsUpdateAction
  | FormActionsReset
>
