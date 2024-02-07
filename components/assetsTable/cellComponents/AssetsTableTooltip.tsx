import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import { Translatable } from 'components/Translatable'
import { productHubIcons } from 'features/productHub/content'
import React from 'react'
import { Box, Text } from 'theme-ui'

import type { AssetsTableTooltipProps } from './AssetsTableTooltip.types'

export function AssetsTableTooltip({
  content: { title, description },
  icon,
  iconColor,
}: AssetsTableTooltipProps) {
  return (
    <StatefulTooltip
      tooltip={
        <Box sx={{ lineHeight: 'body', fontWeight: 'regular' }}>
          {title && (
            <Text as="span" sx={{ display: 'block', mb: 1, fontWeight: 'semiBold' }}>
              <Translatable text={title} />
            </Text>
          )}
          <Translatable text={description} />
        </Box>
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
      <Icon size={16} icon={productHubIcons[icon]} color={iconColor ?? 'interactive100'} />
    </StatefulTooltip>
  )
}
