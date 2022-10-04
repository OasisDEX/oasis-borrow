import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  AutoTakeProfitTriggerData,
  prepareAddAutoTakeProfitTriggerData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetAutoTakeProfitTxHandlersParams {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  vaultData: Vault
  isAddForm: boolean
  autoTakeProfitState: AutoTakeProfitFormChange
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
  autoTakeProfitState,
}: GetAutoTakeProfitTxHandlersParams): AutoTakeProfitTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    ()=>
    prepareAddAutoTakeProfitTriggerData(
    vaultData,
    autoTakeProfitTriggerData.executionPrice,
    autoTakeProfitTriggerData.maxBaseFeeInGwei,
    autoTakeProfitTriggerData.isToCollateral,
    autoTakeProfitTriggerData.triggerId.toNumber(),
  ),
  [
    autoTakeProfitState.toCollateral,
    autoTakeProfitState.executionCollRatio,
    autoTakeProfitState.executionPrice,
    autoTakeProfitTriggerData.triggerId.toNumber(),
  ]
  )
  // TODO ŁW
  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-price',
        executionPrice: zero, // TODO ŁW not sure if 0s make sense like in sl
        executionCollRatio: zero,
      })
    }
  }

  return { addTxData, textButtonHandlerExtension }
}
