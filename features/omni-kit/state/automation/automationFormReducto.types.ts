import type BigNumber from 'bignumber.js'
import type { AutomationFeatures } from 'features/automation/common/types'
import type { FormActionsReset } from 'features/omni-kit/state'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { TriggerAction } from 'helpers/triggers'
import type { ReductoActions } from 'helpers/useReducto'

export interface OmniAutomationFormState {
  targetLtv?: BigNumber
  triggerLtv?: BigNumber
  extraTriggerLtv?: BigNumber
  trailingDistance?: BigNumber
  minSellPrice?: BigNumber
  maxBuyPrice?: BigNumber
  price?: BigNumber
  maxGasFee?: BigNumber
  ltvStep?: BigNumber
  percentageOffset?: BigNumber
  useThreshold?: boolean
  resolveTo?: OmniCloseTo
  uiDropdownProtection?: AutomationFeatures
  uiDropdownOptimization?: AutomationFeatures
  action?: TriggerAction
}

export interface AutomationFormActionsUpdateTargetLtv {
  type: 'update-target-ltv'
  targetLtv?: BigNumber
}

export interface AutomationFormActionsUpdateTriggerLtv {
  type: 'update-trigger-ltv'
  triggerLtv?: BigNumber
}

export interface AutomationFormActionsUpdateExtraTriggerLtv {
  type: 'update-extra-trigger-ltv'
  extraTriggerLtv?: BigNumber
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

export interface AutomationFormActionsUpdatePrice {
  type: 'update-price'
  price?: BigNumber
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

export interface AutomationFormActionsUpdateUseThreshold {
  type: 'update-use-threshold'
  useThreshold?: boolean
}

export interface AutomationFormActionsUpdateAction {
  type: 'update-action'
  action?: TriggerAction
}

export type OmniAutomationFormActions = ReductoActions<
  OmniAutomationFormState,
  | AutomationFormActionsUpdateTargetLtv
  | AutomationFormActionsUpdateTriggerLtv
  | AutomationFormActionsUpdateExtraTriggerLtv
  | AutomationFormActionsUpdateTrailingDistance
  | AutomationFormActionsUpdateMinSellPrice
  | AutomationFormActionsUpdateMaxBuyPrice
  | AutomationFormActionsUpdatePrice
  | AutomationFormActionsUpdateMaxGasFee
  | AutomationFormActionsUpdateLtvStep
  | AutomationFormActionsUpdatePercentageOffset
  | AutomationFormActionsUpdateUseThreshold
  | AutomationFormActionsUpdateAction
  | FormActionsReset
>
