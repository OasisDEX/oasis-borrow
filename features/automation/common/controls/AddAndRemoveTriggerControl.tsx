import { removeAutomationBotAggregatorTriggers } from 'blockchain/calls/automationBotAggregator.constants'
import type { AutomationBotRemoveTriggersData } from 'blockchain/calls/automationBotAggregator.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAutomationFeatureTxHandlers } from 'features/automation/common/state/automationFeatureTxHandlers'
import { addTransactionMap } from 'features/automation/common/txDefinitions'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate.constants'
import { uiChanges } from 'helpers/uiChanges'
import { useEffect, useMemo } from 'react'

import type { AddAndRemoveTriggerControlProps } from './AddAndRemoveTriggerControl.types'

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
