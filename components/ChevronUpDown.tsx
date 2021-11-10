import React, { ComponentProps } from 'react'
import { SxStyleProp } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons'

export default function ChevronUpDown({ isUp, variant, sx, ...props }: {
  isUp: boolean,
  variant?: string,
  sx?: SxStyleProp,
} & Omit<ComponentProps<typeof Icon>, 'name'>) {
  return <Icon
    sx={{ variant: `chevronUpDown.${variant}`, ...sx }}
    name={isUp ? 'chevron_up' : 'chevron_down'}
    {...props}
  />
}