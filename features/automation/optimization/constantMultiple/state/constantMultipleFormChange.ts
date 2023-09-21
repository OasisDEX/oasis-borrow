import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers/calculateCollRatioFromMultiple'

import type {
  ConstantMultipleChangeAction,
  ConstantMultipleFormChange,
} from './constantMultipleFormChange.types'

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
        multipliers: action.multipliers,
        defaultMultiplier: action.defaultMultiplier,
        eligibleMultipliers: action.eligibleMultipliers,
        defaultCollRatio: action.defaultCollRatio,
        minTargetRatio: action.minTargetRatio,
        maxTargetRatio: action.maxTargetRatio,
      }
    case 'is-editing':
      return { ...state, isEditing: action.isEditing, isResetAction: false }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'is-reset-action':
      return { ...state, isResetAction: action.isResetAction }
    default:
      return state
  }
}
