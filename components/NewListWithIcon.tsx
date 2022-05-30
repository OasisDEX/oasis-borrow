import { Icon } from '@makerdao/dai-ui-icons'
import { Trans } from 'next-i18next'
import React from 'react'
import { theme } from 'theme'
import { Box, Grid, SxStyleProp, Text } from 'theme-ui'

interface IListWithIconProps {
  items: string[]
  icon?: string
  iconSize?: number | string | number[]
  textVariant?: string
  iconColor?: string
  listStyle?: SxStyleProp
  itemStyle?: SxStyleProp
  iconStyle?: SxStyleProp
}

export function NewListWithIcon({
  items,
  icon = 'checkmark',
  iconSize = '14px',
  textVariant = 'paragraph3',
  iconColor = theme.colors.primary,
  listStyle,
  itemStyle,
  iconStyle,
}: IListWithIconProps) {
  return (
    <Box>
      <Grid as="ul" gap={3} sx={{ m: 0, p: 0, listStyle: 'none', ...listStyle }}>
        {items.map((item, k) => (
          <Text
            as="li"
            key={k}
            variant={textVariant}
            sx={{
              position: 'relative',
              pl: 4,
              color: 'text.subtitle',
              strong: {
                color: theme.colors.primary,
              },
              ...itemStyle,
            }}
          >
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              sx={{ position: 'absolute', top: '3px', left: 0, ...iconStyle }}
            />
            <Trans
              defaults={item}
              components={{
                1: <strong />,
              }}
            />
            {/* <span dangerouslySetInnerHTML={{ __html: item }} /> */}
          </Text>
        ))}
      </Grid>
    </Box>
  )
}
