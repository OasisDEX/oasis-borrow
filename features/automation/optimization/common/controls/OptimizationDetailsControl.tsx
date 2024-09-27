import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { AutoBuyDetailsControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import React from 'react'

export function OptimizationDetailsControl() {
  const { protocol } = useAutomationContext()

  const { isAutoBuyAvailable, isTakeProfitAvailable } = getAvailableAutomation(protocol)

  return (
    <>
      {isAutoBuyAvailable && <AutoBuyDetailsControl />}
      {isTakeProfitAvailable && <AutoTakeProfitDetailsControl />}
    </>
  )
}
