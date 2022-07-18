import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutoBuyFormControl } from 'features/automation/optimization/controls/AutoBuyFormControl'
import { TxError } from 'helpers/types'

export const BASIC_SELL_FORM_CHANGE = 'BASIC_SELL_FORM_CHANGE'
export const BASIC_BUY_FORM_CHANGE = 'BASIC_BUY_FORM_CHANGE'
export const CONSTANT_MULTIPLE_FORM_CHANGE = 'CONSTANT_MULTIPLE_FORM_CHANGE'

export type CurrentBSForm = 'add' | 'remove'

export type BasicBSTriggerResetData = Pick<
  BasicBSFormChange,
  'execCollRatio' | 'targetCollRatio' | 'maxBuyOrMinSellPrice' | 'maxBaseFeeInGwei'
> & {
  withThreshold: boolean
}

type AutomationChangeAction =   | { type: 'trigger-id'; triggerId: BigNumber }
| { type: 'execution-coll-ratio'; execCollRatio: BigNumber }
| { type: 'target-coll-ratio'; targetCollRatio: BigNumber }
| { type: 'continuous'; continuous: boolean }
| { type: 'deviation'; deviation: BigNumber }
| { type: 'max-gas-fee-in-gwei'; maxBaseFeeInGwei: BigNumber }
| { type: 'current-form'; currentForm: CurrentBSForm }
| { type: 'reset'; resetData: BasicBSTriggerResetData }
| {
    type: 'tx-details'
    txDetails: {
      txStatus?: TxStatus
      txError?: TxError
      txHash?: string
      txCost?: BigNumber
    }
  }

export type BasicBSChangeAction = AutomationChangeAction 
  | { type: 'max-buy-or-sell-price'; maxBuyOrMinSellPrice?: BigNumber }
  | { type: 'with-threshold'; withThreshold: boolean }

export type ConstantMultipleChangeAction = AutomationChangeAction
| { type: 'max-buy-price'; maxBuyPrice?: BigNumber }
| { type: 'min-sell-price'; minSellPrice?: BigNumber }
| { type: 'buy-with-threshold'; buyWithThreshold: boolean }
| { type: 'sell-with-threshold'; sellWithThreshold: boolean }
| { type: 'multiplier'; multiplier: number }



export function basicBSFormChangeReducer(
  state: BasicBSFormChange,
  action: BasicBSChangeAction,
): BasicBSFormChange {
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
    case 'reset':
      return { ...state, ...action.resetData }
    default:
      return state
  }
}

type AutomationFormChange = {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  currentForm: CurrentBSForm
  resetData: BasicBSTriggerResetData
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}

export type BasicBSFormChange = AutomationFormChange & 
{  
  maxBuyOrMinSellPrice?: BigNumber,
  withThreshold: boolean
}

export type ConstantMultipleFormChange = AutomationFormChange & {
  maxBuyPrice?: BigNumber
  minSellPrice?: BigNumber
  buyWithThreshold: boolean
  sellWithThreshold: boolean
  multiplier: number
}
