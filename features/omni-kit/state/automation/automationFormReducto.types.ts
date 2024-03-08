import type BigNumber from 'bignumber.js'
import type { AutomationFeatures } from 'features/automation/common/types'
import type { FormActionsReset } from 'features/omni-kit/state'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationFormState {
  targetLtv?: BigNumber
  triggerLtv?: BigNumber
  resolveTo?: OmniCloseTo
  uiDropdown?: AutomationFeatures
}

export interface AutomationFormActionsUpdateTargetLtv {
  type: 'update-target-ltv'
  targetLtv?: BigNumber
}

export interface AutomationFormActionsUpdateTriggerLtv {
  type: 'update-trigger-ltv'
  triggerLtv?: BigNumber
}

export interface AutomationFormActionsUpdateTrailingDistance {
  type: 'update-trailing-distance'
  trailingDistance?: BigNumber
}

export interface AutomationFormActionsUpdateMinSellPrice {
  type: 'update-min-sell-price'
  minSellPrice?: BigNumber
}

export interface AutomationFormActionsUpdateMaxBuyPrice {
  type: 'update-max-buy-price'
  maxBuyPrice?: BigNumber
}

export interface AutomationFormActionsUpdateMaxGasFee {
  type: 'update-max-gas-fee'
  maxGasFee?: BigNumber
}

export interface AutomationFormActionsUpdateLtvStep {
  type: 'update-ltv-step'
  ltvStep?: BigNumber
}

export interface AutomationFormActionsUpdatePercentageOffset {
  type: 'update-percentage-offset'
  percentageOffset?: BigNumber
}

export type OmniAutomationFormActions = ReductoActions<
  OmniAutomationFormState,
  | AutomationFormActionsUpdateTargetLtv
  | AutomationFormActionsUpdateTriggerLtv
  | AutomationFormActionsUpdateTrailingDistance
  | AutomationFormActionsUpdateMinSellPrice
  | AutomationFormActionsUpdateMaxBuyPrice
  | AutomationFormActionsUpdateMaxGasFee
  | AutomationFormActionsUpdateLtvStep
  | AutomationFormActionsUpdatePercentageOffset
  | FormActionsReset
>
