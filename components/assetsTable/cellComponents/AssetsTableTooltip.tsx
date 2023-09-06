import React from 'react'
import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { Translatable, TranslatableType } from 'components/Translatable'
import { Text } from 'theme-ui'

export interface AssetsTableTooltipProps {
  content: {
    title?: TranslatableType
    description: TranslatableType
  }
  icon: string
  iconColor?: string
}

export function AssetsTableTooltip({
  content: { title, description },
  icon,
  iconColor,
}: AssetsTableTooltipProps) {
  return (
    <StatefulTooltip
      tooltip={
        <>
          {title && (
            <Text as="span" sx={{ display: 'block', mb: 1, fontWeight: 'semiBold' }}>
              <Translatable text={title} />
            </Text>
          )}
          <Translatable text={description} />
        </>
      }
      containerSx={{ position: 'relative', top: '2px', display: 'inline-flex', ml: 1 }}
      tooltipSx={{
        top: '24px',
        width: '250px',
        fontSize: 1,
        whiteSpace: 'initial',
        textAlign: 'left',
        border: 'none',
        borderRadius: 'medium',
        boxShadow: 'buttonMenu',
      }}
    >
      <Icon size={16} name={icon} color={iconColor || 'interactive100'} />
    </StatefulTooltip>
  )
}
