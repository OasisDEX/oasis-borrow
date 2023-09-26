import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { AutomationFormType } from 'features/automation/common/state/automationFeatureChange.types'
import type { TxError } from 'helpers/types'

export type StopLossResetData = Pick<
  StopLossFormChange,
  'stopLossLevel' | 'collateralActive' | 'txDetails'
>

export interface StopLossFormChange {
  stopLossLevel: BigNumber
  collateralActive: boolean
  currentForm: AutomationFormType
  isAwaitingConfirmation: boolean
  resetData: StopLossResetData
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}

export type StopLossFormChangeAction =
  | { type: 'stop-loss-level'; stopLossLevel: BigNumber }
  | { type: 'close-type'; toCollateral: boolean }
  | { type: 'current-form'; currentForm: AutomationFormType }
  | { type: 'is-awaiting-confirmation'; isAwaitingConfirmation: boolean }
  | { type: 'reset'; resetData: StopLossResetData }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }
