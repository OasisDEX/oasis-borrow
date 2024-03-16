import type BigNumber from 'bignumber.js'
import type { FormActionsReset } from 'features/omni-kit/state'
import type {
  AutomationFormActionsUpdateAction,
  AutomationFormActionsUpdatePrice,
  AutomationFormActionsUpdateTrailingDistance,
} from 'features/omni-kit/state/automation/common'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationTrailingStopLossFormState {
  trailingDistance?: BigNumber
  price?: BigNumber
  resolveTo: OmniCloseTo
  action: TriggerAction
}

export type OmniAutomationTrailingStopLossFormActions = ReductoActions<
  OmniAutomationTrailingStopLossFormState,
  | AutomationFormActionsUpdateTrailingDistance
  | AutomationFormActionsUpdateAction
  | AutomationFormActionsUpdatePrice
  | FormActionsReset
>
