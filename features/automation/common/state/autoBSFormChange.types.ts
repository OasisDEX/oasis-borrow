import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { TxError } from 'helpers/types'

import type { AutomationFormType } from './automationFeatureChange.types'

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
