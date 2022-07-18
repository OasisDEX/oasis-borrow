import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { AutoBuyFormControl } from 'features/automation/optimization/controls/AutoBuyFormControl'
import { getActiveOptimizationFeature } from 'features/automation/protection/common/helpers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { AutomationChangeFeature, AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useConstantMultipleStateInitialization } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useEffect } from 'react'
import { ConstantMultipleFormControl } from './ConstantMultipleFormControl'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  txHelpers?: TxHelpers
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
  tokenMarketPrice: BigNumber
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  priceInfo,
  txHelpers,
  context,
  balanceInfo,
  ethMarketPrice,
  tokenMarketPrice,
}: OptimizationFormControlProps) {
  const autoBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)
  const autoSellTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicSell)
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)


  const { isConstantMultipleActive, isAutoBuyActive } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: false, //TODO ŁW for now it will be always false as contract  is not deployed yet
    section: 'form',
  })

  useEffect(() => {
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: 'autoBuy',
      })
    }
  }, [])
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  console.log('activeAutomationFeature')
  console.log(activeAutomationFeature)
  useConstantMultipleStateInitialization()
  return (
    <>
    <AutoBuyFormControl
        vault={vault}
        ilkData={ilkData}
        priceInfo={priceInfo}
        balanceInfo={balanceInfo}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        stopLossTriggerData={stopLossTriggerData}
        isAutoBuyOn={autoBuyTriggerData.isTriggerEnabled}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        tokenMarketPrice={tokenMarketPrice} 
        isAutoBuyActive={isAutoBuyActive} />
{constantMultipleEnabled && 
     <ConstantMultipleFormControl context={context} isConstantMultipleActive={isConstantMultipleActive}/>
}      
      </>
  )
}
