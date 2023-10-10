import type BigNumber from 'bignumber.js'
import type {
  AutomationChangeAction,
  AutomationFormChange,
} from 'features/automation/common/state/autoBSFormChange.types'

export type ConstantMultipleChangeAction =
  | AutomationChangeAction
  | { type: 'max-buy-price'; maxBuyPrice?: BigNumber }
  | { type: 'min-sell-price'; minSellPrice?: BigNumber }
  | { type: 'buy-with-threshold'; buyWithThreshold: boolean }
  | { type: 'sell-with-threshold'; sellWithThreshold: boolean }
  | { type: 'multiplier'; multiplier: number }
  | { type: 'buy-execution-coll-ratio'; buyExecutionCollRatio: BigNumber }
  | { type: 'sell-execution-coll-ratio'; sellExecutionCollRatio: BigNumber }
  | { type: 'is-editing'; isEditing: boolean }
  | { type: 'is-awaiting-confirmation'; isAwaitingConfirmation: boolean }
  | {
      type: 'form-defaults'
      multipliers: number[]
      eligibleMultipliers: number[]
      defaultMultiplier: number
      defaultCollRatio: BigNumber
      minTargetRatio: BigNumber
      maxTargetRatio: BigNumber
    }
  | { type: 'is-reset-action'; isResetAction: boolean }

export type ConstantMultipleFormChange = AutomationFormChange & {
  maxBuyPrice?: BigNumber
  minSellPrice?: BigNumber
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  buyWithThreshold: boolean
  sellWithThreshold: boolean
  multipliers: number[]
  eligibleMultipliers: number[]
  defaultMultiplier: number
  defaultCollRatio: BigNumber
  multiplier: number
  minTargetRatio: BigNumber
  maxTargetRatio: BigNumber
  isEditing: boolean
  isResetAction: boolean
  isAwaitingConfirmation: boolean
}
