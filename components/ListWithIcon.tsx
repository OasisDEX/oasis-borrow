import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Box, Grid, SxStyleProp, Text } from 'theme-ui'

interface IListWithIconProps {
  items: string[]
  icon?: string
  iconSize?: number | string | number[]
  textVariant?: string
  listStyle?: SxStyleProp
  itemStyle?: SxStyleProp
  iconStyle?: SxStyleProp
}

export function ListWithIcon({
  items,
  icon = 'checkbox',
  iconSize = '20px',
  textVariant = 'paragraph3',
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
            sx={{ position: 'relative', pl: 4, color: 'text.subtitle', ...itemStyle }}
          >
            <Icon
              name={icon}
              size={iconSize}
              sx={{ position: 'absolute', top: 0, left: 0, ...iconStyle }}
            />
            {item}
          </Text>
        ))}
      </Grid>
    </Box>
  )
}
