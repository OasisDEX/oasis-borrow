import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { extractConstantMultipleData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { BasicBuyDetailsControl } from 'features/automation/optimization/controls/BasicBuyDetailsControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { ConstantMultipleDetailsControl } from './ConstantMultipleDetailsControl'

interface OptimizationDetailsControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
}

export function OptimizationDetailsControl({
  automationTriggersData,
  vault,
  vaultHistory,
  tokenMarketPrice,
}: OptimizationDetailsControlProps) {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  const basicBuyTriggerData = extractBasicBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicBuy,
  })
  const constantMultipleTriggerData = extractConstantMultipleData(automationTriggersData)

  return (
    <>
      <BasicBuyDetailsControl vault={vault} basicBuyTriggerData={basicBuyTriggerData} />
      {constantMultipleEnabled && (
        <ConstantMultipleDetailsControl
          vault={vault}
          vaultHistory={vaultHistory}
          tokenMarketPrice={tokenMarketPrice}
          constantMultipleTriggerData={constantMultipleTriggerData}
        />
      )}
    </>
  )
}
