import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
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
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useMemo } from 'react'

export interface AutomationTxHandlerAnalytics {
  id: { add: AutomationEventIds; edit: AutomationEventIds; remove: AutomationEventIds }
  page: Pages
  additionalParams: {
    triggerValue?: string
    triggerBuyValue?: string
    triggerSellValue?: string
    targetMultiple?: string
    targetValue?: string
    maxBuyPrice?: string
    minSellPrice?: string
    maxGasFee?: string
    closeTo?: CloseVaultTo
  }
}
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
  vaultId: BigNumber
  collateralizationRatio: BigNumber
  ilk: string
  analytics: AutomationTxHandlerAnalytics
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
  vaultId,
  ilk,
  collateralizationRatio,
  analytics,
}: GetAutomationFeatureTxHandlersParams): AutomationFeatureTxHandlers {
  const { uiChanges } = useAppContext()
  const triggerEnabled = !!triggersId.filter((item) => item).length

  const analyticsAdditionalParams = {
    vaultId: vaultId.toString(),
    ilk,
    collateralRatio: collateralizationRatio
      .times(100)
      .decimalPlaces(2, BigNumber.ROUND_DOWN)
      .toString(),
  }

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

          trackingEvents.automation.buttonClick(
            triggerEnabled ? analytics.id.edit : analytics.id.add,
            analytics.page,
            CommonAnalyticsSections.Form,
            { ...analyticsAdditionalParams, ...analytics.additionalParams },
          )
        }
        if (isRemoveForm) {
          removeAutomationTrigger(txHelpers, removeTxData, uiChanges, ethMarketPrice, publishType)

          trackingEvents.automation.buttonClick(
            analytics.id.remove,
            analytics.page,
            CommonAnalyticsSections.Form,
            {
              ...analyticsAdditionalParams,
              ...analytics.additionalParams,
            },
          )
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
