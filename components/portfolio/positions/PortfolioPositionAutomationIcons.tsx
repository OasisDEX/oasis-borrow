import { AutomationIcon } from 'components/AutomationIcon'
import React from 'react'

import type { PortfolioPosition } from 'lambdas/src/shared/domain-types'

export const PortfolioPositionAutomationIcons = ({
  automations = {},
}: {
  automations: PortfolioPosition['automations']
}) => {
  return (
    <>
      {automations.stopLoss && (
        <AutomationIcon enabled={automations.stopLoss.enabled} type="stopLoss" />
      )}
      {automations.autoBuy && (
        <AutomationIcon enabled={automations.autoBuy.enabled} type="autoBuy" />
      )}
      {automations.autoSell && (
        <AutomationIcon enabled={automations.autoSell.enabled} type="autoSell" />
      )}
      {automations.takeProfit && (
        <AutomationIcon enabled={automations.takeProfit.enabled} type="takeProfit" />
      )}
    </>
  )
}
