import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
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
  id: BigNumber
  owner: string
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  isAddForm: boolean
}

interface AutoTakeProfitTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoTakeProfitTxHandlers({
  id,
  owner,
  autoTakeProfitTriggerData,
  isAddForm,
  autoTakeProfitState,
}: GetAutoTakeProfitTxHandlersParams): AutoTakeProfitTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddAutoTakeProfitTriggerData({
        id,
        owner,
        executionPrice: autoTakeProfitState.executionPrice,
        maxBaseFeeInGwei: maxUint32,
        isCloseToCollateral: autoTakeProfitState.toCollateral,
        replacedTriggerId: autoTakeProfitTriggerData.triggerId.toNumber(),
      }),
    [
      autoTakeProfitState.toCollateral,
      autoTakeProfitState.executionPrice.toNumber(),
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
