import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers'
import { extractConstantMultipleData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { AutoBuyFormControl } from 'features/automation/optimization/controls/AutoBuyFormControl'
import { getActiveOptimizationFeature } from 'features/automation/protection/common/helpers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useEffect } from 'react'

import { ConstantMultipleFormControl } from './ConstantMultipleFormControl'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  ilkData: IlkData
  txHelpers?: TxHelpers
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  txHelpers,
  context,
  balanceInfo,
  ethMarketPrice,
}: OptimizationFormControlProps) {
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const autoBuyTriggerData = extractBasicBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicBuy,
  })
  const autoSellTriggerData = extractBasicBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicSell,
  })
  const constantMultipleTriggerData = extractConstantMultipleData(automationTriggersData)
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isConstantMultipleActive, isAutoBuyActive } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: false, //TODO ŁW for now it will be always false as cache is not implemented yet, cannot determine if trigger exist
    section: 'form',
  })

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  useEffect(() => {
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: 'autoBuy',
      })
    }
  }, [])
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  return (
    <>
      <AutoBuyFormControl
        vault={vault}
        ilkData={ilkData}
        balanceInfo={balanceInfo}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        stopLossTriggerData={stopLossTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        isAutoBuyOn={autoBuyTriggerData.isTriggerEnabled}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        isAutoBuyActive={isAutoBuyActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
      {constantMultipleEnabled && (
        <ConstantMultipleFormControl
          context={context}
          isConstantMultipleActive={isConstantMultipleActive}
          txHelpers={txHelpers}
          vault={vault}
          ethMarketPrice={ethMarketPrice}
          ilkData={ilkData}
          autoSellTriggerData={autoSellTriggerData}
          autoBuyTriggerData={autoBuyTriggerData}
          stopLossTriggerData={stopLossTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          balanceInfo={balanceInfo}
          shouldRemoveAllowance={shouldRemoveAllowance}
        />
      )}
    </>
  )
}
