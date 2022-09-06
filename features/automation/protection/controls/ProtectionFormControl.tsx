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
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { AutoSellFormControl } from 'features/automation/protection/controls/AutoSellFormControl'
import { StopLossFormControl } from 'features/automation/protection/controls/StopLossFormControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface ProtectionFormControlProps {
  ilkData: IlkData
  automationTriggersData: TriggersData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  txHelpers?: TxHelpers
  context: Context
  ethMarketPrice: BigNumber
}

export function ProtectionFormControl({
  ilkData,
  automationTriggersData,
  priceInfo,
  vault,
  balanceInfo,
  context,
  txHelpers,
  ethMarketPrice,
}: ProtectionFormControlProps) {
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
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'form',
  })

  useEffect(() => {
    if (isAutoSellActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: 'autoSell',
      })
    }
  }, [])

  return (
    <>
      <StopLossFormControl
        ilkData={ilkData}
        stopLossTriggerData={stopLossTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        priceInfo={priceInfo}
        vault={vault}
        balanceInfo={balanceInfo}
        isStopLossActive={isStopLossActive}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
      <AutoSellFormControl
        vault={vault}
        ilkData={ilkData}
        balanceInfo={balanceInfo}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        stopLossTriggerData={stopLossTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        isAutoSellActive={isAutoSellActive}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
    </>
  )
}
