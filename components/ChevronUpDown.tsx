import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { chevron_down, chevron_up } from 'theme/icons'

import { Icon } from './Icon'
import type { IconProps } from './Icon.types'

export function ChevronUpDown({
  isUp,
  variant,
  sx,
  ...props
}: {
  isUp: boolean
  variant?: string
  sx?: ThemeUIStyleObject
} & Omit<IconProps, 'icon'>) {
  return (
    <Icon
      sx={{ variant: `chevronUpDown.${variant}`, ...sx }}
      icon={isUp ? chevron_up : chevron_down}
      {...props}
    />
  )
}
