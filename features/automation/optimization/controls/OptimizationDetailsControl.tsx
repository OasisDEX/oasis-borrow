import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { BasicBuyDetailsControl } from 'features/automation/optimization/controls/BasicBuyDetailsControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { ConstantMultipleDetailsControl } from './ConstantMultipleDetailsControl'

interface OptimizationDetailsControlProps {
  vault: Vault
  vaultType: VaultType
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
}

export function OptimizationDetailsControl({
  vault,
  vaultType,
  vaultHistory,
  tokenMarketPrice,
}: OptimizationDetailsControlProps) {
  const { autoBuyTriggerData, constantMultipleTriggerData } = useAutomationContext()
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  return (
    <>
      <BasicBuyDetailsControl vault={vault} basicBuyTriggerData={autoBuyTriggerData} />
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
