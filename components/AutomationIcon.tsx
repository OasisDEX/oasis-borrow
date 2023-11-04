import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { auto_buy, auto_sell, stop_loss, take_profit } from 'theme/icons'
import { Text } from 'theme-ui'

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
      tooltip={<Text variant="paragraph4">{tPortfolio(`automation-details.${type}`)}</Text>}
      tooltipSx={{
        mt: '-98px', // just above the icon
        height: '58px',
        borderRadius: 'medium',
      }}
      containerSx={{
        width: '34px',
        height: '34px',
        backgroundColor: enabled ? 'success100' : 'secondary60',
        ':hover': {
          backgroundColor: enabled ? 'success10' : 'secondary60',
          '& path': {
            color: enabled ? 'success100' : 'primary60',
          },
        },
        cursor: 'pointer',
        borderRadius: 'round',
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon
        icon={automationIconMap[type]}
        size={20}
        sx={{
          '& path': {
            color: enabled ? 'white' : 'primary60',
          },
        }}
      />
    </StatefulTooltip>
  )
}
