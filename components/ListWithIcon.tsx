import { Icon } from '@makerdao/dai-ui-icons'
import { Trans } from 'next-i18next'
import React, { ReactNode } from 'react'
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
  components?: { [key: number]: ReactNode }
}

export function ListWithIcon({
  items,
  icon = 'checkbox',
  iconSize = '20px',
  textVariant = 'paragraph3',
  iconColor,
  listStyle,
  itemStyle,
  iconStyle,
  components = {},
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
              color: 'neutral80',
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
                1: <Text as="strong" sx={{ color: 'primary100' }} />,
                ...components,
              }}
            />
          </Text>
        ))}
      </Grid>
    </Box>
  )
}
