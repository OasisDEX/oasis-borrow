import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { amountToWei } from 'blockchain/utils'
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
  vault: Vault
  isAddForm: boolean
  autoTakeProfitState: AutoTakeProfitFormChange
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
        amountToWei(
          autoTakeProfitState.executionPrice.decimalPlaces(0, BigNumber.ROUND_DOWN),
          'ETH',
        ),
        zero, // autoTakeProfitState.maxBaseFeeInGwei,
        autoTakeProfitState.toCollateral,
        0,
        // autoTakeProfitTriggerData.triggerId.toNumber(),
      ),
    [
      autoTakeProfitState.toCollateral,
      autoTakeProfitState.executionCollRatio,
      autoTakeProfitState.executionPrice,
      autoTakeProfitTriggerData.triggerId.toNumber(),
    ],
  )
  // TODO ŁW
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
