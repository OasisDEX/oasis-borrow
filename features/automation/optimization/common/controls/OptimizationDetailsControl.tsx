import { useAutomationContext } from 'components/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers'
import { AutoBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import { ConstantMultipleDetailsControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import React from 'react'

interface OptimizationDetailsControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationDetailsControl({ vaultHistory }: OptimizationDetailsControlProps) {
  const { protocol } = useAutomationContext()

  const { isAutoBuyAvailable, isConstantMultipleAvailable, isTakeProfitAvailable } =
    getAvailableAutomation(protocol)

  return (
    <>
      {isAutoBuyAvailable && <AutoBuyDetailsControl />}
      {isConstantMultipleAvailable && (
        <ConstantMultipleDetailsControl vaultHistory={vaultHistory} />
      )}
      {isTakeProfitAvailable && <AutoTakeProfitDetailsControl />}
    </>
  )
}
