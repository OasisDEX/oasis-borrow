import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { auto_buy, auto_sell, stop_loss, take_profit } from 'theme/icons'

import type { PortfolioPosition } from 'lambdas/src/shared/domain-types'

const automationIconMap: Record<keyof PortfolioPosition['automations'], typeof stop_loss> = {
  autoBuy: auto_buy,
  autoSell: auto_sell,
  takeProfit: take_profit,
  stopLoss: stop_loss,
}

export const AutomationIcon = ({
  enabled,
  type,
}: {
  enabled: boolean
  type: keyof PortfolioPosition['automations']
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <StatefulTooltip
      tooltip={tPortfolio(`automation-details.${type}`)}
      containerSx={{
        position: 'relative',
        backgroundColor: enabled ? 'success100' : 'secondary60',
        borderRadius: 'ellipse',
        transition: 'background-color 200ms, color 200ms',
        ...(enabled && {
          '&:hover': {
            backgroundColor: 'success10',
            '& path': {
              color: 'success100',
            },
          },
        }),
      }}
      tooltipSx={{
        bottom: '100%',
        mb: 1,
        fontSize: 1,
        textAlign: 'left',
        border: 'none',
        borderRadius: 'medium',
        boxShadow: 'buttonMenu',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon
        icon={automationIconMap[type]}
        size="34px"
        sx={{
          display: 'block',
          p: 2,
          transition: 'path 200ms',
          '& path': {
            color: enabled ? 'white' : 'primary60',
          },
        }}
      />
    </StatefulTooltip>
  )
}
