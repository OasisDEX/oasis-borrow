import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import {
  AutoTakeProfitTriggerData,
  prepareAddAutoTakeProfitTriggerData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'

interface GetAutoTakeProfitTxHandlersParams {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  vaultData: Vault
  replacedTriggerId: number
}

interface AutoTakeProfitTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoTakeProfitTxHandlers({
  vaultData,
  autoTakeProfitTriggerData,
  replacedTriggerId,
}: GetAutoTakeProfitTxHandlersParams): AutoTakeProfitTxHandlers {
  const addTxData = prepareAddAutoTakeProfitTriggerData(
    vaultData,
    autoTakeProfitTriggerData.executionPrice,
    autoTakeProfitTriggerData.maxBaseFeeInGwei,
    autoTakeProfitTriggerData.isToCollateral,
    replacedTriggerId,
  )
  // TODO ŁW
  function textButtonHandlerExtension() {}

  return { addTxData, textButtonHandlerExtension }
}
