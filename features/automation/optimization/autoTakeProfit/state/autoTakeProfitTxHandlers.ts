import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  AutoTakeProfitTriggerData,
  prepareAddAutoTakeProfitTriggerData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { zero } from 'helpers/zero'

interface GetAutoTakeProfitTxHandlersParams {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  vaultData: Vault
  isAddForm: boolean
}

interface AutoTakeProfitTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoTakeProfitTxHandlers({
  vaultData,
  autoTakeProfitTriggerData,
  isAddForm,
}: GetAutoTakeProfitTxHandlersParams): AutoTakeProfitTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = prepareAddAutoTakeProfitTriggerData(
    vaultData,
    autoTakeProfitTriggerData.executionPrice,
    autoTakeProfitTriggerData.maxBaseFeeInGwei,
    autoTakeProfitTriggerData.isToCollateral,
    autoTakeProfitTriggerData.triggerId.toNumber(),
  )
  // TODO ŁW
  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        executionCollRatio: zero,
      })
    }
  }

  return { addTxData, textButtonHandlerExtension }
}
