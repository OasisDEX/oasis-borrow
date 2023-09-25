import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import type { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot.types'
import { maxUint32 } from 'features/automation/common/consts'
import { prepareAddAutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange.constants'
import type { AutoTakeProfitFormChange } from './autoTakeProfitFormChange.types'
import type { AutoTakeProfitTriggerData } from './autoTakeProfitTriggerData.types'

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
