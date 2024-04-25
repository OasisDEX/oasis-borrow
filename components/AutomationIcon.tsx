import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { StatefulTooltip } from 'components/Tooltip'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { auto_buy, auto_sell, constant_multiple, stop_loss, take_profit } from 'theme/icons'

interface AutomationIconProps {
  enabled: boolean
  iconNotActiveBg?: string
  type: keyof PortfolioPosition['automations']
}

const automationIconMap: Record<keyof PortfolioPosition['automations'], IconProps['icon']> = {
  autoBuy: auto_buy,
  autoSell: auto_sell,
  constantMultiple: constant_multiple,
  stopLoss: stop_loss,
  takeProfit: take_profit,
}

export const AutomationIcon = ({ enabled, iconNotActiveBg, type }: AutomationIconProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <StatefulTooltip
      tooltip={tPortfolio(`automation-details.${type}`)}
      containerSx={{
        position: 'relative',
        p: '6px',
        backgroundColor: enabled ? 'success10' : iconNotActiveBg ?? 'secondary60',
        borderRadius: 'ellipse',
        color: enabled ? 'success100' : 'primary60',
      }}
      tooltipSx={{
        top: '100%',
        mt: 1,
        fontSize: 1,
        textAlign: 'left',
        border: 'none',
        borderRadius: 'medium',
        boxShadow: 'buttonMenu',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon icon={automationIconMap[type]} size="24px" sx={{ display: 'block' }} />
    </StatefulTooltip>
  )
}
