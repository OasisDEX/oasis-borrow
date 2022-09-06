import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { CurrentBSForm } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { TxError } from 'helpers/types'

export const STOP_LOSS_FORM_CHANGE = 'STOP_LOSS_FORM_CHANGE'
export type StopLossResetData = Pick<
  StopLossFormChange,
  'selectedSLValue' | 'collateralActive' | 'txDetails'
>

export type StopLossFormChangeAction =
  | { type: 'stop-loss'; stopLoss: BigNumber }
  | { type: 'close-type'; toCollateral: boolean }
  | { type: 'current-form'; currentForm: CurrentBSForm }
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
    case 'stop-loss':
      return { ...state, selectedSLValue: action.stopLoss }
    case 'close-type':
      return { ...state, collateralActive: action.toCollateral }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

export interface StopLossFormChange {
  selectedSLValue: BigNumber
  collateralActive: boolean
  currentForm: CurrentBSForm
  resetData: StopLossResetData
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}
