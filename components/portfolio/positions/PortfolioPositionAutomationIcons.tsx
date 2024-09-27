import { AutomationIcon } from 'components/AutomationIcon'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import React from 'react'

export const PortfolioPositionAutomationIcons = ({
  automations = {},
  iconNotActiveBg,
}: {
  automations: PortfolioPosition['automations']
  iconNotActiveBg?: string
}) => {
  return (
    <>
      {automations.stopLoss && (
        <AutomationIcon
          enabled={automations.stopLoss.enabled}
          type="stopLoss"
          iconNotActiveBg={iconNotActiveBg}
        />
      )}
      {automations.autoBuy && (
        <AutomationIcon
          enabled={automations.autoBuy.enabled}
          type="autoBuy"
          iconNotActiveBg={iconNotActiveBg}
        />
      )}
      {automations.autoSell && (
        <AutomationIcon
          enabled={automations.autoSell.enabled}
          type="autoSell"
          iconNotActiveBg={iconNotActiveBg}
        />
      )}
      {automations.takeProfit && (
        <AutomationIcon
          enabled={automations.takeProfit.enabled}
          type="takeProfit"
          iconNotActiveBg={iconNotActiveBg}
        />
      )}
    </>
  )
}
