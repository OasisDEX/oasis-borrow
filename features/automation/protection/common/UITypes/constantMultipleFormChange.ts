import BigNumber from 'bignumber.js'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers'

import { AutomationChangeAction, AutomationFormChange } from './basicBSFormChange'

export const CONSTANT_MULTIPLE_FORM_CHANGE = 'CONSTANT_MULTIPLE_FORM_CHANGE'

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
  | {
      type: 'form-defaults'
      acceptableMultipliers: number[]
      defaultMultiplier: number
      defaultCollRatio: BigNumber
      minTargetRatio: BigNumber
      maxTargetRatio: BigNumber
    }

export type ConstantMultipleFormChange = AutomationFormChange & {
  maxBuyPrice?: BigNumber
  minSellPrice?: BigNumber
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  buyWithThreshold: boolean
  sellWithThreshold: boolean
  acceptableMultipliers: number[]
  defaultMultiplier: number
  defaultCollRatio: BigNumber
  multiplier: number
  minTargetRatio: BigNumber
  maxTargetRatio: BigNumber
  isEditing: boolean
}

export function constantMultipleFormChangeReducer(
  state: ConstantMultipleFormChange,
  action: ConstantMultipleChangeAction,
): ConstantMultipleFormChange {
  switch (action.type) {
    case 'buy-execution-coll-ratio':
      return { ...state, buyExecutionCollRatio: action.buyExecutionCollRatio }
    case 'sell-execution-coll-ratio':
      return { ...state, sellExecutionCollRatio: action.sellExecutionCollRatio }
    case 'target-coll-ratio':
      return { ...state, targetCollRatio: action.targetCollRatio }
    case 'continuous':
      return { ...state, continuous: action.continuous }
    case 'deviation':
      return { ...state, deviation: action.deviation }
    case 'max-gas-fee-in-gwei':
      return { ...state, maxBaseFeeInGwei: action.maxBaseFeeInGwei }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'max-buy-price':
      return { ...state, maxBuyPrice: action.maxBuyPrice }
    case 'min-sell-price':
      return { ...state, minSellPrice: action.minSellPrice }
    case 'buy-with-threshold':
      return { ...state, buyWithThreshold: action.buyWithThreshold }
    case 'sell-with-threshold':
      return { ...state, sellWithThreshold: action.sellWithThreshold }
    case 'multiplier':
      return {
        ...state,
        multiplier: action.multiplier,
        targetCollRatio: calculateCollRatioFromMultiple(action.multiplier),
      }
    case 'form-defaults':
      return {
        ...state,
        acceptableMultipliers: action.acceptableMultipliers,
        defaultMultiplier: action.defaultMultiplier,
        defaultCollRatio: action.defaultCollRatio,
        minTargetRatio: action.minTargetRatio,
        maxTargetRatio: action.maxTargetRatio,
      }
    case 'is-editing':
      return { ...state, isEditing: action.isEditing }
    default:
      return state
  }
}
