import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { AutoBSTriggerResetData } from 'features/automation/common/state/autoBSFormChange'
import {
  AutomationTxHandlerAnalytics,
  getAutomationFeatureTxHandlers,
} from 'features/automation/common/state/automationFeatureTxHandlers'
import { AutomationPublishType, SidebarAutomationStages } from 'features/automation/common/types'
import { AutoTakeProfitResetData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { addTransactionMap, TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { ReactElement, useEffect } from 'react'

export interface AddAndRemoveTxHandler {
  callOnSuccess?: () => void
}

interface AddAndRemoveTriggerControlProps {
  addTxData: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  ethMarketPrice: BigNumber
  isActiveFlag: boolean
  isAddForm: boolean
  isEditing: boolean
  isRemoveForm: boolean
  publishType: AutomationPublishType
  resetData: StopLossResetData | AutoTakeProfitResetData | AutoBSTriggerResetData
  shouldRemoveAllowance: boolean
  stage: SidebarAutomationStages
  textButtonHandlerExtension?: () => void
  triggersId: number[]
  txHelpers?: TxHelpers
  children: (
    txHandler: (options?: AddAndRemoveTxHandler) => void,
    textButtonHandler: () => void,
  ) => ReactElement
  vault: Vault
  analytics: AutomationTxHandlerAnalytics
}

export function AddAndRemoveTriggerControl({
  addTxData,
  children,
  ethMarketPrice,
  isActiveFlag,
  isAddForm,
  isEditing,
  isRemoveForm,
  publishType,
  resetData,
  shouldRemoveAllowance,
  stage,
  textButtonHandlerExtension,
  triggersId,
  txHelpers,
  vault,
  analytics,
}: AddAndRemoveTriggerControlProps) {
  const { uiChanges } = useAppContext()

  const { removeTxData, textButtonHandler, txHandler } = getAutomationFeatureTxHandlers({
    addTxData,
    ethMarketPrice,
    isAddForm,
    isRemoveForm,
    proxyAddress: vault.owner,
    publishType,
    resetData,
    shouldRemoveAllowance,
    stage,
    textButtonHandlerExtension,
    triggersId,
    txHelpers,
    vaultId: vault.id,
    ilk: vault.ilk,
    collateralizationRatio: vault.collateralizationRatio,
    analytics,
  })

  useEffect(() => {
    if (isActiveFlag && isEditing) {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'add-trigger',
          transaction: addTransactionMap[publishType],
          data: addTxData,
        })
      }
      if (isRemoveForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'remove-triggers',
          transaction: removeAutomationBotAggregatorTriggers,
          data: removeTxData,
        })
      }
    }
  }, [addTxData, removeTxData, isActiveFlag])

  return children(textButtonHandler, txHandler)
}
