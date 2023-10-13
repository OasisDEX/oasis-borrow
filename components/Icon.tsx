import React from 'react'
import { Box } from 'theme-ui'

import type { IconProps } from './Icon.types'

export const Icon = ({
  size = 3,
  color = 'currentColor',
  role = 'presentation',
  focusable = false,
  sx,
  icon,
  ...rest
}: IconProps) => {
  return (
    <Box
      as="svg"
      sx={{ ...sx, size: size }}
      // @ts-ignore
      viewBox={icon.viewBox ?? '0 0 24 24'}
      color={color}
      display="inline-block"
      focusable={focusable}
      role={role}
      {...rest}
    >
      {icon.path}
    </Box>
  )
}
