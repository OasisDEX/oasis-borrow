import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { TxError } from 'helpers/types'

export const STOP_LOSS_FORM_CHANGE = 'STOP_LOSS_FORM_CHANGE'
export type StopLossResetData = Pick<
  StopLossFormChange,
  'stopLossLevel' | 'collateralActive' | 'txDetails'
>

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

export function formChangeReducer(
  state: StopLossFormChange,
  action: StopLossFormChangeAction,
): StopLossFormChange {
  switch (action.type) {
    case 'stop-loss-level':
      return { ...state, stopLossLevel: action.stopLossLevel }
    case 'close-type':
      return { ...state, collateralActive: action.toCollateral }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

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
