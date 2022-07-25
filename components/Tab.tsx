import React from 'react'
import { Button } from 'theme-ui'

import { VaultTabTag } from './vault/VaultTabTag'

export type TabVariant = 'large' | 'medium' | 'small' | 'underline'

interface TabProps {
  label: string | JSX.Element
  value: string
  variant: TabVariant
  selected?: boolean
  tag?: {
    include: boolean
    active: boolean
  }
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function Tab({ variant, value, label, selected, tag, onClick }: TabProps) {
  return (
    <Button
      key={value}
      variant={'tab'}
      onClick={onClick}
      sx={{
        ...styles[variant],
        ...(variant === 'large' && selected ? styles.largeSelected : {}),
        ...(variant === 'medium' && selected ? styles.mediumSelected : {}),
        ...(variant === 'small' && selected ? styles.smallSelected : {}),
        ...(variant === 'underline' && selected ? styles.underlineSelected : {}),
      }}
    >
      {label}
      {variant === 'underline' && tag?.include && <VaultTabTag isEnabled={tag.active} />}
    </Button>
  )
}

const styles = {
  large: {
    fontSize: 3,
    p: 3,
    borderRadius: '58px',
    px: 4,
    '&:hover': {
      color: 'primary100',
    },
  },
  largeSelected: {
    color: 'primary100',
    bg: 'neutral10',
    boxShadow: '0px 1px 6px rgba(37, 39, 61, 0.15)',
  },
  medium: {
    fontSize: 3,
    p: 2,
    borderRadius: '58px',
    px: 4,
    minWidth: '94px',
    '&:hover': {
      color: 'primary100',
    },
  },
  mediumSelected: {
    color: 'neutral10',
    bg: 'primary100',
    '&:hover': {
      color: 'neutral10',
    },
  },
  small: {
    fontSize: 1,
    p: 2,
    borderRadius: '40px',
    px: 3,
    minWidth: '54px',
    '&:hover': {
      color: 'primary100',
    },
  },
  smallSelected: {
    color: 'neutral10',
    bg: 'interactive100',
    '&:hover': {
      color: 'neutral10',
    },
  },
  underline: {
    fontSize: 3,
    transform: 'translateY(3px)',
    borderBottom: '3px solid transparent',
    borderRadius: '0px',
    paddingTop: '12px',
    paddingBottom: '12px',
  },
  underlineSelected: {
    color: 'primary100',
    borderBottom: '3px solid',
    borderColor: 'primary100',
  },
}
