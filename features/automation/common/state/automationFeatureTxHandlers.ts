import { trackingEvents } from 'analytics/trackingEvents'
import type { MixpanelAutomationEventIds, MixpanelPages } from 'analytics/types'
import { MixpanelCommonAnalyticsSections } from 'analytics/types'
import BigNumber from 'bignumber.js'
import {
  addAutomationTrigger,
  removeAutomationTrigger,
} from 'features/automation/api/automationTxHandlers'
import type {
  AutomationAddTriggerData,
  AutomationRemoveTriggerData,
} from 'features/automation/common/txDefinitions.types'
import type {
  AutomationPublishType,
  SidebarAutomationStages,
} from 'features/automation/common/types'
import type { AutomationContracts } from 'features/automation/metadata/types'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { uiChanges } from 'helpers/uiChanges'

export interface AutomationTxHandlerAnalytics {
  id: {
    add: MixpanelAutomationEventIds
    edit: MixpanelAutomationEventIds
    remove: MixpanelAutomationEventIds
  }
  page: MixpanelPages
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
  addTxData: AutomationAddTriggerData
  removeTxData: AutomationRemoveTriggerData
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
  positionRatio: BigNumber
  ilk: string
  analytics: AutomationTxHandlerAnalytics
  txHelpers?: TxHelpers
  contracts?: AutomationContracts
}

interface AutomationFeatureTxHandlers {
  textButtonHandler: () => void
  txHandler: () => void
}

export function getAutomationFeatureTxHandlers({
  addTxData,
  removeTxData,
  ethMarketPrice,
  isAddForm,
  isRemoveForm,
  publishType,
  resetData,
  stage,
  textButtonHandlerExtension,
  triggersId,
  txHelpers,
  vaultId,
  ilk,
  positionRatio,
  analytics,
  contracts,
}: GetAutomationFeatureTxHandlersParams): AutomationFeatureTxHandlers {
  const triggerEnabled = !!triggersId.filter((item) => item).length

  const analyticsAdditionalParams = {
    vaultId: vaultId.toString(),
    ilk,
    collateralRatio: positionRatio.times(100).decimalPlaces(2, BigNumber.ROUND_DOWN).toString(),
  }

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
          addAutomationTrigger(
            txHelpers,
            addTxData,
            uiChanges,
            ethMarketPrice,
            publishType,
            contracts?.addTrigger,
          )

          trackingEvents.automation.buttonClick(
            triggerEnabled ? analytics.id.edit : analytics.id.add,
            analytics.page,
            MixpanelCommonAnalyticsSections.Form,
            { ...analyticsAdditionalParams, ...analytics.additionalParams },
          )
        }
        if (isRemoveForm) {
          removeAutomationTrigger(
            txHelpers,
            removeTxData,
            uiChanges,
            ethMarketPrice,
            publishType,
            contracts?.removeTrigger,
          )

          trackingEvents.automation.buttonClick(
            analytics.id.remove,
            analytics.page,
            MixpanelCommonAnalyticsSections.Form,
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
  }
}
