import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { TxError } from 'helpers/types'

export const AUTO_SELL_FORM_CHANGE = 'AUTO_SELL_FORM_CHANGE'
export const AUTO_BUY_FORM_CHANGE = 'AUTO_BUY_FORM_CHANGE'

export type AutoBSTriggerResetData = Pick<
  AutoBSFormChange,
  'execCollRatio' | 'targetCollRatio' | 'maxBuyOrMinSellPrice' | 'maxBaseFeeInGwei'
> & {
  withThreshold: boolean
}

export type AutomationChangeAction =
  | { type: 'target-coll-ratio'; targetCollRatio: BigNumber }
  | { type: 'continuous'; continuous: boolean }
  | { type: 'deviation'; deviation: BigNumber }
  | { type: 'max-gas-fee-in-gwei'; maxBaseFeeInGwei: BigNumber }
  | { type: 'current-form'; currentForm: AutomationFormType }
  | { type: 'reset'; resetData: AutoBSTriggerResetData }
  | { type: 'is-editing'; isEditing: boolean }
  | { type: 'is-awaiting-confirmation'; isAwaitingConfirmation: boolean }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }

export type AutoBSChangeAction =
  | AutomationChangeAction
  | { type: 'trigger-id'; triggerId: BigNumber }
  | { type: 'max-buy-or-sell-price'; maxBuyOrMinSellPrice?: BigNumber }
  | { type: 'with-threshold'; withThreshold: boolean }
  | { type: 'execution-coll-ratio'; execCollRatio: BigNumber }
  | {
      type: 'form-defaults'
      targetCollRatio: BigNumber
      execCollRatio: BigNumber
    }

export function autoBSFormChangeReducer(
  state: AutoBSFormChange,
  action: AutoBSChangeAction,
): AutoBSFormChange {
  switch (action.type) {
    case 'trigger-id':
      return { ...state, triggerId: action.triggerId }
    case 'execution-coll-ratio':
      return { ...state, execCollRatio: action.execCollRatio }
    case 'target-coll-ratio':
      return { ...state, targetCollRatio: action.targetCollRatio }
    case 'max-buy-or-sell-price':
      return { ...state, maxBuyOrMinSellPrice: action.maxBuyOrMinSellPrice }
    case 'continuous':
      return { ...state, continuous: action.continuous }
    case 'deviation':
      return { ...state, deviation: action.deviation }
    case 'max-gas-fee-in-gwei':
      return { ...state, maxBaseFeeInGwei: action.maxBaseFeeInGwei }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'with-threshold':
      return { ...state, withThreshold: action.withThreshold }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    case 'is-editing':
      return { ...state, isEditing: action.isEditing }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'form-defaults':
      return {
        ...state,
        targetCollRatio: action.targetCollRatio,
        execCollRatio: action.execCollRatio,
      }
    default:
      return state
  }
}

export type AutomationFormChange = {
  triggerId: BigNumber
  targetCollRatio: BigNumber
  continuous: boolean
  isEditing: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  currentForm: AutomationFormType
  resetData: AutoBSTriggerResetData
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}

export type AutoBSFormChange = AutomationFormChange & {
  maxBuyOrMinSellPrice?: BigNumber
  withThreshold: boolean
  execCollRatio: BigNumber
  isAwaitingConfirmation: boolean
}
