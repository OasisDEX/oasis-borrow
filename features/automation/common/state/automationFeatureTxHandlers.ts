import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import {
  addAutomationTrigger,
  removeAutomationTrigger,
} from 'features/automation/api/automationTxHandlers'
import { AutomationPublishType, SidebarAutomationStages } from 'features/automation/common/types'
import { useMemo } from 'react'

interface TxHandlerParams {
  callOnSuccess?: () => void
}

interface GetAutomationFeatureTxHandlersParams {
  addTxData: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  ethMarketPrice: BigNumber
  isAddForm: boolean
  isRemoveForm: boolean
  proxyAddress: string
  publishType: AutomationPublishType
  resetData: any
  shouldRemoveAllowance: boolean
  stage: SidebarAutomationStages
  textButtonHandlerExtension?: () => void
  triggersId: number[]
  txHelpers?: TxHelpers
}

interface AutomationFeatureTxHandlers {
  textButtonHandler: () => void
  txHandler: () => void
  removeTxData: AutomationBotRemoveTriggersData
}

export function getAutomationFeatureTxHandlers({
  addTxData,
  ethMarketPrice,
  isAddForm,
  isRemoveForm,
  proxyAddress,
  publishType,
  resetData,
  shouldRemoveAllowance,
  stage,
  textButtonHandlerExtension,
  triggersId,
  txHelpers,
}: GetAutomationFeatureTxHandlersParams): AutomationFeatureTxHandlers {
  const { uiChanges } = useAppContext()

  const removeTxData: AutomationBotRemoveTriggersData = useMemo(
    () => ({
      removeAllowance: shouldRemoveAllowance,
      proxyAddress,
      triggersId,
      kind: TxMetaKind.removeTriggers,
    }),
    [shouldRemoveAllowance, proxyAddress, triggersId],
  )

  function txHandler(options?: TxHandlerParams) {
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
        options?.callOnSuccess && options.callOnSuccess()
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

  return {
    textButtonHandler,
    txHandler,
    removeTxData,
  }
}
