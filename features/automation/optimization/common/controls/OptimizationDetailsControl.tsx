import { AutoBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import { ConstantMultipleDetailsControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import React from 'react'

interface OptimizationDetailsControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationDetailsControl({ vaultHistory }: OptimizationDetailsControlProps) {
  return (
    <>
      <AutoBuyDetailsControl />
      <ConstantMultipleDetailsControl vaultHistory={vaultHistory} />
      <AutoTakeProfitDetailsControl />
    </>
  )
}
