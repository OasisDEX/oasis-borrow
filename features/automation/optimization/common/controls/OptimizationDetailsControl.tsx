import { AutoBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import { ConstantMultipleDetailsControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import React from 'react'

interface OptimizationDetailsControlProps {
  vaultType: VaultType
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationDetailsControl({
  vaultType,
  vaultHistory,
}: OptimizationDetailsControlProps) {
  return (
    <>
      <AutoBuyDetailsControl />
      <ConstantMultipleDetailsControl vaultType={vaultType} vaultHistory={vaultHistory} />
      <AutoTakeProfitDetailsControl />
    </>
  )
}
