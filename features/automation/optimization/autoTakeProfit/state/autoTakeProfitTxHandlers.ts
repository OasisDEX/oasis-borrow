import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { maxUint32 } from 'features/automation/common/consts'
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
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  isAddForm: boolean
  vault: Vault
}

interface AutoTakeProfitTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoTakeProfitTxHandlers({
  vault,
  autoTakeProfitTriggerData,
  isAddForm,
  autoTakeProfitState,
}: GetAutoTakeProfitTxHandlersParams): AutoTakeProfitTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddAutoTakeProfitTriggerData(
        vault,
        autoTakeProfitState.executionPrice,
        maxUint32,
        autoTakeProfitState.toCollateral,
        autoTakeProfitState.triggerId.toNumber(),
      ),
    [
      autoTakeProfitState.toCollateral,
      autoTakeProfitState.executionCollRatio,
      autoTakeProfitState.executionPrice,
      autoTakeProfitTriggerData.triggerId.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
        type: 'execution-price',
        executionPrice: zero,
        executionCollRatio: zero,
      })
    }
  }

  return { addTxData, textButtonHandlerExtension }
}
