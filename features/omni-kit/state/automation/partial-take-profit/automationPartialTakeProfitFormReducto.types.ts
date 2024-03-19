import type BigNumber from 'bignumber.js'
import type { FormActionsReset } from 'features/omni-kit/state'
import type {
  AutomationFormActionsUpdateAction,
  AutomationFormActionsUpdateExtraTriggerLtv,
  AutomationFormActionsUpdateLtvStep,
  AutomationFormActionsUpdatePercentageOffset,
  AutomationFormActionsUpdatePrice,
  AutomationFormActionsUpdateTriggerLtv,
} from 'features/omni-kit/state/automation/common'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationPartialTakeProfitFormState {
  triggerLtv?: BigNumber
  extraTriggerLtv?: BigNumber
  trailingDistance?: BigNumber
  price?: BigNumber
  ltvStep?: BigNumber
  percentageOffset?: BigNumber
  resolveTo?: OmniCloseTo
  action: TriggerAction
}

export type OmniAutomationPartialTakeProfitFormActions = ReductoActions<
  OmniAutomationPartialTakeProfitFormState,
  | AutomationFormActionsUpdateTriggerLtv
  | AutomationFormActionsUpdateExtraTriggerLtv
  | AutomationFormActionsUpdatePrice
  | AutomationFormActionsUpdateLtvStep
  | AutomationFormActionsUpdatePercentageOffset
  | AutomationFormActionsUpdateAction
  | FormActionsReset
>
