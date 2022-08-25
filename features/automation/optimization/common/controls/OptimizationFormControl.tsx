import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutoBuyFormControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { getActiveOptimizationFeature } from 'features/automation/optimization/common/helpers'
import { ConstantMultipleFormControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleFormControl'
import { extractConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  txHelpers?: TxHelpers
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  vaultType,
  ilkData,
  txHelpers,
  context,
  balanceInfo,
  ethMarketPrice,
}: OptimizationFormControlProps) {
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const autoBuyTriggerData = extractAutoBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicBuy,
  })
  const autoSellTriggerData = extractAutoBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicSell,
  })

  const constantMultipleTriggerData = extractConstantMultipleData(automationTriggersData)
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isConstantMultipleActive, isAutoBuyActive } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: constantMultipleTriggerData.isTriggerEnabled,
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
    if (constantMultipleTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: 'constantMultiple',
      })
    }
  }, [])

  return (
    <>
      <AutoBuyFormControl
        vault={vault}
        vaultType={vaultType}
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
    </>
  )
}
