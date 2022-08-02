import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
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
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)
  // TODO: PK initialize and get constantMultiplyTriggerData here
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  return (
    <>
      <BasicBuyDetailsControl vault={vault} basicBuyTriggerData={basicBuyTriggerData} />
      {constantMultipleEnabled && (
        <ConstantMultipleDetailsControl
          vault={vault}
          vaultHistory={vaultHistory}
          tokenMarketPrice={tokenMarketPrice}
          // TODO: PK pass constantMultiplyTriggerData to component
        />
      )}
    </>
  )
}
