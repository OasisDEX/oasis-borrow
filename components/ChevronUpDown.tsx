import { Icon } from '@makerdao/dai-ui-icons'
import type { ComponentProps } from 'react'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'

export function ChevronUpDown({
  isUp,
  variant,
  sx,
  ...props
}: {
  isUp: boolean
  variant?: string
  sx?: SxStyleProp
} & Omit<ComponentProps<typeof Icon>, 'name'>) {
  return (
    <Icon
      sx={{ variant: `chevronUpDown.${variant}`, ...sx }}
      name={isUp ? 'chevron_up' : 'chevron_down'}
      {...props}
    />
  )
}
