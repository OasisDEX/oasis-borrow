import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
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
  account?: string
}

export function ProtectionFormControl({
  ilkData,
  automationTriggersData,
  priceInfo,
  vault,
  account,
  balanceInfo,
  context,
  txHelpers,
  ethMarketPrice,
}: ProtectionFormControlProps) {
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const autoSellTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicSell)
  const autoBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)
  const constantMultipleTriggerData = {} as any
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()

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
        account={account}
        balanceInfo={balanceInfo}
        isStopLossActive={isStopLossActive}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
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
      />
    </>
  )
}
