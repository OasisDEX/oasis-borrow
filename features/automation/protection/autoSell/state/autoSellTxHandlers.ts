import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { prepareAddAutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetAutoSellTxHandlersParams {
  autoSellState: AutoBSFormChange
  isAddForm: boolean
  vault: Vault
}

interface AutoSellTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoSellTxHandlers({
  autoSellState,
  isAddForm,
  vault,
}: GetAutoSellTxHandlersParams): AutoSellTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        vaultData: vault,
        triggerType: TriggerType.BasicSell,
        execCollRatio: autoSellState.execCollRatio,
        targetCollRatio: autoSellState.targetCollRatio,
        maxBuyOrMinSellPrice: autoSellState.withThreshold
          ? autoSellState.maxBuyOrMinSellPrice || zero
          : zero,
        continuous: autoSellState.continuous,
        deviation: autoSellState.deviation,
        replacedTriggerId: autoSellState.triggerId,
        maxBaseFeeInGwei: autoSellState.maxBaseFeeInGwei,
      }),
    [
      autoSellState.execCollRatio.toNumber(),
      autoSellState.targetCollRatio.toNumber(),
      autoSellState.maxBuyOrMinSellPrice?.toNumber(),
      autoSellState.triggerId.toNumber(),
      autoSellState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'target-coll-ratio',
        targetCollRatio: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
