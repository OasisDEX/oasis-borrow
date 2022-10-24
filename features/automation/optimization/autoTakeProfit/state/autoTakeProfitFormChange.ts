import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationFormChange } from 'features/automation/common/state/autoBSFormChange'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { TxError } from 'helpers/types'

export const AUTO_TAKE_PROFIT_FORM_CHANGE = 'AUTO_TAKE_PROFIT_FORM_CHANGE'

export type AutoTakeProfitFormChangeAction =
  | { type: 'trigger-id'; triggerId: BigNumber }
  | { type: 'execution-price'; executionPrice: BigNumber; executionCollRatio: BigNumber }
  | { type: 'current-form'; currentForm: AutomationFormType }
  | { type: 'close-type'; toCollateral: boolean }
  | { type: 'is-editing'; isEditing: boolean }
  | { type: 'is-awaiting-confirmation'; isAwaitingConfirmation: boolean }
  | { type: 'reset'; resetData: AutoTakeProfitResetData }
  | {
      type: 'form-defaults'
      executionPrice: BigNumber
      executionCollRatio: BigNumber
      toCollateral: boolean
    }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }

export function autoTakeProfitFormChangeReducer(
  state: AutoTakeProfitFormChange,
  action: AutoTakeProfitFormChangeAction,
): AutoTakeProfitFormChange {
  switch (action.type) {
    case 'trigger-id':
      return { ...state, triggerId: action.triggerId }
    case 'execution-price':
      return {
        ...state,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
      }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'close-type':
      return { ...state, toCollateral: action.toCollateral }
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
        defaultExecutionPrice: action.executionPrice,
        defaultExecutionCollRatio: action.executionCollRatio,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
        toCollateral: action.toCollateral,
      }
    default:
      return state
  }
}

export type AutoTakeProfitResetData = Pick<
  AutoTakeProfitFormChange,
  'executionPrice' | 'executionCollRatio' | 'toCollateral' | 'txDetails' | 'isEditing'
>

export type AutoTakeProfitFormChange = AutomationFormChange & {
  currentForm: AutomationFormType
  defaultExecutionCollRatio: BigNumber
  defaultExecutionPrice: BigNumber
  executionCollRatio: BigNumber
  executionPrice: BigNumber
  toCollateral: boolean
  isAwaitingConfirmation: boolean
}
