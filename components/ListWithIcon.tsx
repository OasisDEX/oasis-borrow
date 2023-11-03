import { Trans } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { checkbox } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Grid, Text } from 'theme-ui'

import { Icon } from './Icon'
import type { IconProps } from './Icon.types'

interface IListWithIconProps {
  items: string[]
  icon?: IconProps['icon']
  withIcon?: boolean
  iconSize?: number | string | number[]
  textVariant?: string
  iconColor?: string
  listStyle?: ThemeUIStyleObject
  itemStyle?: ThemeUIStyleObject
  iconStyle?: ThemeUIStyleObject
  components?: { [key: number]: ReactNode }
}

export function ListWithIcon({
  items,
  icon = checkbox,
  withIcon = true,
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
            {withIcon && (
              <Icon
                icon={icon}
                size={iconSize}
                color={iconColor}
                sx={{ position: 'absolute', top: '3px', left: 0, ...iconStyle }}
              />
            )}
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
