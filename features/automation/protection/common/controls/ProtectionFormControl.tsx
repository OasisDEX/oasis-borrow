import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutoSellFormControl } from 'features/automation/protection/autoSell/controls/AutoSellFormControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossFormControl } from 'features/automation/protection/stopLoss/controls/StopLossFormControl'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface ProtectionFormControlProps {
  ilkData: IlkData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  txHelpers?: TxHelpers
  context: Context
  ethMarketPrice: BigNumber
}

export function ProtectionFormControl({
  ilkData,
  priceInfo,
  vault,
  balanceInfo,
  context,
  txHelpers,
  ethMarketPrice,
}: ProtectionFormControlProps) {
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    automationTriggersData,
  } = useAutomationContext()

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
    if (isStopLossActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: 'stopLoss',
      })
    }
  }, [autoSellTriggerData.isTriggerEnabled, stopLossTriggerData.isStopLossEnabled])

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
