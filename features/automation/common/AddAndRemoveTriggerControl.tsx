import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import {
  addAutomationTrigger,
  AutomationPublishType,
  removeAutomationTrigger,
} from 'features/automation/common/automationTxHandlers'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { addTransactionMap, TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { ReactElement, useEffect, useMemo } from 'react'

interface AddAndRemoveTriggerControlProps {
  txHelpers?: TxHelpers
  ethMarketPrice: BigNumber
  children: (txHandler: () => void, textButtonHandler: () => void) => ReactElement
  isEditing: boolean
  removeAllowance: boolean
  proxyAddress: string
  triggersId: number[]
  stage: SidebarVaultStages
  addTxData: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  resetData: any
  publishType: AutomationPublishType
  currentForm: 'add' | 'remove'
  isActiveFlag: boolean
  textButtonHandlerExtension?: () => void
}

export function AddAndRemoveTriggerControl({
  txHelpers,
  ethMarketPrice,
  isEditing,
  children,
  triggersId,
  proxyAddress,
  removeAllowance,
  stage,
  addTxData,
  resetData,
  publishType,
  currentForm,
  isActiveFlag,
  textButtonHandlerExtension,
}: AddAndRemoveTriggerControlProps) {
  const { uiChanges } = useAppContext()

  const isAddForm = currentForm === 'add'
  const isRemoveForm = currentForm === 'remove'

  const removeTxData: AutomationBotRemoveTriggersData = useMemo(
    () => ({
      removeAllowance,
      proxyAddress,
      triggersId,
      kind: TxMetaKind.removeTriggers,
    }),
    [removeAllowance, proxyAddress, triggersId],
  )

  function txHandler() {
    if (txHelpers) {
      if (stage === 'txSuccess') {
        uiChanges.publish(publishType, {
          type: 'reset',
          resetData,
        })
        uiChanges.publish(publishType, {
          type: 'tx-details',
          txDetails: {},
        })
        uiChanges.publish(publishType, {
          type: 'current-form',
          currentForm: 'add',
        })
      } else {
        if (isAddForm) {
          addAutomationTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice, publishType)
        }
        if (isRemoveForm) {
          removeAutomationTrigger(txHelpers, removeTxData, uiChanges, ethMarketPrice, publishType)
        }
      }
    }
  }

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

  function textButtonHandler() {
    uiChanges.publish(publishType, {
      type: 'current-form',
      currentForm: isAddForm ? 'remove' : 'add',
    })
    uiChanges.publish(publishType, {
      type: 'reset',
      resetData,
    })

    textButtonHandlerExtension && textButtonHandlerExtension()
  }

  return children(txHandler, textButtonHandler)
}
