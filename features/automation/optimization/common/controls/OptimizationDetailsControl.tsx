import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { extractAutoBSData } from 'features/automation/common/state/basicBSTriggerData'
import { BasicBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/BasicBuyDetailsControl'
import { ConstantMultipleDetailsControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { extractConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

interface OptimizationDetailsControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  vaultType: VaultType
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
}

export function OptimizationDetailsControl({
  automationTriggersData,
  vault,
  vaultType,
  vaultHistory,
  tokenMarketPrice,
}: OptimizationDetailsControlProps) {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  const basicBuyTriggerData = extractAutoBSData({
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
          vaultType={vaultType}
          vaultHistory={vaultHistory}
          tokenMarketPrice={tokenMarketPrice}
          constantMultipleTriggerData={constantMultipleTriggerData}
        />
      )}
    </>
  )
}
