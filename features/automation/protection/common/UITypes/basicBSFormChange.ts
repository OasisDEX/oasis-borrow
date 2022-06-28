import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { MaxGasPriceValues } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { TxError } from 'helpers/types'

export const BASIC_SELL_FORM_CHANGE = 'BASIC_SELL_FORM_CHANGE'
export const BASIC_BUY_FORM_CHANGE = 'BASIC_BUY_FORM_CHANGE'

/* End of section */
export type BasicBSChangeAction =
  | { type: 'trigger-id'; triggerId: BigNumber }
  | { type: 'execution-coll-ratio'; execCollRatio: BigNumber }
  | { type: 'target-coll-ratio'; targetCollRatio: BigNumber }
  | { type: 'max-buy-or-sell-price'; maxBuyOrMinSellPrice?: BigNumber }
  | { type: 'continuous'; continuous: boolean }
  | { type: 'deviation'; deviation: BigNumber }
  | { type: 'max-gas-percentage-price'; maxGasPercentagePrice: MaxGasPriceValues }
  | { type: 'with-threshold'; withThreshold: boolean }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }

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
    case 'max-gas-percentage-price':
      return { ...state, maxGasPercentagePrice: action.maxGasPercentagePrice }
    case 'with-threshold':
      return { ...state, withThreshold: action.withThreshold }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

export interface BasicBSFormChange {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice?: BigNumber
  continuous: boolean
  deviation: BigNumber
  withThreshold: boolean
  maxGasPercentagePrice?: MaxGasPriceValues
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}
