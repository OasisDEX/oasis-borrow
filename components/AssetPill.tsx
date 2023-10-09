import { AppLink } from 'components/Links'
import React from 'react'

import { Icon } from './Icon'
import type { IconProps } from './Icon.types'

interface AssetPillProps {
  icon: IconProps['icon']
  label: string
  link: string
}

export function AssetPill({ icon, label, link }: AssetPillProps) {
  return (
    <AppLink
      href={link}
      sx={{
        display: 'flex',
        alignItems: 'center',
        lineHeight: '34px',
        px: 3,
        fontSize: 1,
        color: 'primary100',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        bg: 'rgba(255, 255, 255, 0.5)',
        transition: 'border-color 200ms, background-color 200ms',
        '&:hover': {
          borderColor: 'neutral30',
          bg: 'neutral30',
        },
      }}
    >
      <Icon icon={icon} size={20} sx={{ mr: 1 }} />
      {label}
    </AppLink>
  )
}
