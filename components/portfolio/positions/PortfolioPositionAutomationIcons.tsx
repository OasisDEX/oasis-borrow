import { AutomationIcon } from 'components/AutomationIcon'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import React from 'react'

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
