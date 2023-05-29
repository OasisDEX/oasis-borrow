import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import React from 'react'
import { Text } from 'theme-ui'

export interface AssetsTableTooltipProps {
  content: {
    title: string
    description: string
  }
  icon: string
}

export function AssetsTableTooltip({ content, icon }: AssetsTableTooltipProps) {
  return (
    <StatefulTooltip
      tooltip={
        <>
          <Text as="span" sx={{ display: 'block', mb: 1, fontWeight: 'semiBold' }}>
            {content.title}
          </Text>
          {content.description}
        </>
      }
      containerSx={{ position: 'relative', top: '2px', display: 'inline-flex', ml: 1 }}
      tooltipSx={{
        width: '240px',
        fontSize: 1,
        whiteSpace: 'initial',
        textAlign: 'left',
        border: 'none',
        borderRadius: 'medium',
        boxShadow: 'buttonMenu',
      }}
    >
      <Icon size={16} name={icon} color="interactive100" />
    </StatefulTooltip>
  )
}
