import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { AutomationBotAddAggregatorTriggerData } from 'blockchain/calls/automationBotAggregator.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'

import type { ConstantMultipleFormChange } from './constantMultipleFormChange.types'
import type { ConstantMultipleTriggerData } from './constantMultipleTriggerData.types'

export interface GetConstantMultipleTxHandlersParams {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  constantMultipleState: ConstantMultipleFormChange
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAddForm: boolean
  positionRatio: BigNumber
  id: BigNumber
  owner: string
}
export interface ConstantMultipleTxHandlers {
  addTxData: AutomationBotAddAggregatorTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}
