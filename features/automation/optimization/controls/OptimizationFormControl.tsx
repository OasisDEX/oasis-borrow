import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { AutoBuyFormControl } from 'features/automation/optimization/controls/AutoBuyFormControl'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import React, { useEffect } from 'react'

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
  const autoBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)
  const autoSellTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicSell)
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const { uiChanges } = useAppContext()

  useEffect(() => {
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: 'autoBuy',
      })
    }
  }, [])

  return (
    <AutoBuyFormControl
      vault={vault}
      ilkData={ilkData}
      balanceInfo={balanceInfo}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      stopLossTriggerData={stopLossTriggerData}
      isAutoBuyOn={autoBuyTriggerData.isTriggerEnabled}
      context={context}
      txHelpers={txHelpers}
      ethMarketPrice={ethMarketPrice}
    />
  )
}
