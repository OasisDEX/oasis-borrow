import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { AutomationFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { AutomationFormType } from 'features/automation/common/state/automationFeatureChange.types'
import type { TxError } from 'helpers/types'

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
