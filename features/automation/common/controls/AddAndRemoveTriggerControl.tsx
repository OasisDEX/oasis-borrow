import {
  AutomationBotRemoveTriggersData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AutoBSTriggerResetData } from 'features/automation/common/state/autoBSFormChange'
import {
  AutomationTxHandlerAnalytics,
  getAutomationFeatureTxHandlers,
} from 'features/automation/common/state/automationFeatureTxHandlers'
import {
  addTransactionMap,
  AutomationAddTriggerData,
  AutomationRemoveTriggerData,
} from 'features/automation/common/txDefinitions'
import { AutomationPublishType, SidebarAutomationStages } from 'features/automation/common/types'
import { AutomationContracts } from 'features/automation/metadata/types'
import { AutoTakeProfitResetData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { ReactElement, useEffect, useMemo } from 'react'

export interface AddAndRemoveTxHandler {
  callOnSuccess?: () => void
}

interface AddAndRemoveTriggerControlProps {
  addTxData: AutomationAddTriggerData
  removeTxData?: AutomationRemoveTriggerData
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
  analytics: AutomationTxHandlerAnalytics
  // TODO contracts prop is optional until we will have metadata for all auto features
  contracts?: AutomationContracts
}

export function AddAndRemoveTriggerControl({
  addTxData,
  removeTxData: _removeTxData,
  children,
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
  analytics,
  contracts,
}: AddAndRemoveTriggerControlProps) {
  const { uiChanges } = useAppContext()
  const {
    environmentData: { ethMarketPrice },
    positionData: { id, ilk, owner, positionRatio },
  } = useAutomationContext()

  // TODO it won't be necessary anymore when we will have matadata for all auto features
  const removeTxData = useMemo(
    () =>
      _removeTxData ||
      ({
        removeAllowance: shouldRemoveAllowance,
        proxyAddress: owner,
        triggersId,
        kind: TxMetaKind.removeTriggers,
      } as AutomationBotRemoveTriggersData),
    [shouldRemoveAllowance, owner, triggersId],
  )

  const { textButtonHandler, txHandler } = getAutomationFeatureTxHandlers({
    addTxData,
    ethMarketPrice,
    isAddForm,
    isRemoveForm,
    proxyAddress: owner,
    publishType,
    resetData,
    shouldRemoveAllowance,
    stage,
    textButtonHandlerExtension,
    triggersId,
    txHelpers,
    vaultId: id,
    ilk,
    positionRatio,
    analytics,
    contracts,
    removeTxData,
  })

  useEffect(() => {
    if (isActiveFlag && isEditing && stage !== 'txSuccess' && stage !== 'txInProgress') {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'tx-data',
          transaction: contracts ? contracts.addTrigger : addTransactionMap[publishType],
          data: addTxData,
        })
      }
      if (isRemoveForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'tx-data',
          transaction: contracts ? contracts.removeTrigger : removeAutomationBotAggregatorTriggers,
          data: removeTxData,
        })
      }
    }
  }, [addTxData, removeTxData, isActiveFlag])

  return children(textButtonHandler, txHandler)
}
