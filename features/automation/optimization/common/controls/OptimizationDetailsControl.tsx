import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AutoBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import { ConstantMultipleDetailsControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

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
  const autoTakeProfitEnabled = useFeatureToggle('AutoTakeProfit')

  return (
    <>
      <AutoBuyDetailsControl
        vault={vault}
        autoBuyTriggerData={autoBuyTriggerData}
        isconstantMultipleEnabled={constantMultipleTriggerData.isTriggerEnabled}
      />
      {constantMultipleEnabled && (
        <ConstantMultipleDetailsControl
          vault={vault}
          vaultType={vaultType}
          vaultHistory={vaultHistory}
          tokenMarketPrice={tokenMarketPrice}
          constantMultipleTriggerData={constantMultipleTriggerData}
        />
      )}
      {autoTakeProfitEnabled && <AutoTakeProfitDetailsControl vault={vault} />}
    </>
  )
}
