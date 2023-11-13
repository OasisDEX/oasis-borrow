import { AutomationIcon } from 'components/AutomationIcon'
import { AppLink } from 'components/Links'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import React from 'react'

export const PortfolioPositionAutomationIcons = ({
  automations = {},
  url,
}: {
  automations: PortfolioPosition['automations']
  url: string
}) => {
  return (
    <>
      {automations.stopLoss && (
        <AppLink href={url} hash="protection">
          <AutomationIcon enabled={automations.stopLoss.enabled} type="stopLoss" />
        </AppLink>
      )}
      {automations.autoBuy && (
        <AppLink href={url} hash="optimization">
          <AutomationIcon enabled={automations.autoBuy.enabled} type="autoBuy" />
        </AppLink>
      )}
      {automations.autoSell && (
        <AppLink href={url} hash="protection">
          <AutomationIcon enabled={automations.autoSell.enabled} type="autoSell" />
        </AppLink>
      )}
      {automations.takeProfit && (
        <AppLink href={url} hash="optimization">
          <AutomationIcon enabled={automations.takeProfit.enabled} type="takeProfit" />
        </AppLink>
      )}
    </>
  )
}
