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
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoBuyFormControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { AutoTakeProfitFormControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitFormControl'
import { getActiveOptimizationFeature } from 'features/automation/optimization/common/helpers'
import { ConstantMultipleFormControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleFormControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useEffect } from 'react'

interface OptimizationFormControlProps {
  balanceInfo: BalanceInfo
  context: Context
  ethMarketPrice: BigNumber
  tokenMarketPrice: BigNumber
  ilkData: IlkData
  txHelpers?: TxHelpers
  vault: Vault
  vaultType: VaultType
}

export function OptimizationFormControl({
  balanceInfo,
  context,
  ethMarketPrice,
  tokenMarketPrice,
  ilkData,
  txHelpers,
  vault,
  vaultType,
}: OptimizationFormControlProps) {
  const {
    autoBuyTriggerData,
    automationTriggersData,
    autoSellTriggerData,
    constantMultipleTriggerData,
    stopLossTriggerData,
  } = useAutomationContext()

  // TODO: TDAutoTakeProfit | to be replaced with data from autoTakeProfitTriggerData from useAutomationContext method
  const autoTakeProfitTriggerData = {
    isTriggerEnabled: false,
  }

  const { uiChanges } = useAppContext()
  const autoTakeProfitEnabled = useFeatureToggle('AutoTakeProfit')

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const {
    isConstantMultipleActive,
    isAutoBuyActive,
    isAutoTakeProfitActive,
  } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitOn: autoTakeProfitEnabled, // TODO ŁW automationTriggersData?.autoTakeProfit?.isTriggerEnabled,
    section: 'form',
  })

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  useEffect(() => {
    if (autoTakeProfitTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
      })
    }
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
      })
    }
    if (constantMultipleTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
      })
    }
    // TODO ŁW: add autoTakeProfit
  }, [])

  return (
    <>
      <AutoBuyFormControl
        autoBuyTriggerData={autoBuyTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        balanceInfo={balanceInfo}
        constantMultipleTriggerData={constantMultipleTriggerData}
        context={context}
        ethMarketPrice={ethMarketPrice}
        ilkData={ilkData}
        isAutoBuyActive={isAutoBuyActive}
        isAutoBuyOn={autoBuyTriggerData.isTriggerEnabled}
        shouldRemoveAllowance={shouldRemoveAllowance}
        stopLossTriggerData={stopLossTriggerData}
        txHelpers={txHelpers}
        vault={vault}
        vaultType={vaultType}
      />
      <ConstantMultipleFormControl
        autoBuyTriggerData={autoBuyTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        balanceInfo={balanceInfo}
        constantMultipleTriggerData={constantMultipleTriggerData}
        context={context}
        ethMarketPrice={ethMarketPrice}
        ilkData={ilkData}
        isConstantMultipleActive={isConstantMultipleActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        stopLossTriggerData={stopLossTriggerData}
        txHelpers={txHelpers}
        vault={vault}
      />
      <AutoTakeProfitFormControl
        autoBuyTriggerData={autoBuyTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        isAutoTakeProfitActive={isAutoTakeProfitActive}
        tokenMarketPrice={tokenMarketPrice}
        vault={vault}
      />
    </>
  )
}
