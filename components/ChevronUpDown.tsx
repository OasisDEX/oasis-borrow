import type { ComponentProps } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'

export function ChevronUpDown({
  isUp,
  variant,
  sx,
  ...props
}: {
  isUp: boolean
  variant?: string
  sx?: ThemeUIStyleObject
} & Omit<ComponentProps<typeof Icon>, 'name'>) {
  return (
    <Icon
      sx={{ variant: `chevronUpDown.${variant}`, ...sx }}
      name={isUp ? 'chevron_up' : 'chevron_down'}
      {...props}
    />
  )
}
