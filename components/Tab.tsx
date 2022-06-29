import { Button } from 'theme-ui'

import { TabSection } from './dumb/Tabs'
import { VaultTabTag } from './vault/VaultTabTag'

interface TabProps {
  section: Omit<TabSection, 'content'>
  hash: string
  variant: 'large' | 'medium' | 'small' | 'underline'
  tabTagActive?: boolean
  tag?: {
    include: boolean
    active: boolean
  }
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const styles = {
  large: {
    fontSize: 3,
    p: '19px',
    borderRadius: '58px',
    paddingLeft: '86px',
    paddingRight: '86px',
    '&:hover': {
      color: 'primary',
    },
  },
  largeActive: {
    color: 'primary',
    bg: 'background',
    boxShadow: '0px 1px 6px rgba(37, 39, 61, 0.15)',
  },
  medium: {
    fontSize: 3,
    p: '12px',
    borderRadius: '58px',
    paddingLeft: '32px',
    paddingRight: '32px',
    minWidth: '94px',
    '&:hover': {
      color: 'primary',
    },
  },
  mediumActive: {
    color: 'text.contrast',
    bg: 'primary',
    '&:hover': {
      color: 'text.contrast',
    },
  },
  small: {
    fontSize: 1,
    p: '8px',
    borderRadius: '40px',
    paddingLeft: '16px',
    paddingRight: '16px',
    minWidth: '54px',
    '&:hover': {
      color: 'primary',
    },
  },
  smallActive: {
    color: 'text.contrast',
    bg: '#575CFE',
    '&:hover': {
      color: 'text.constrast',
    },
  },
  underline: {
    fontSize: 3,
    borderBottom: '3px solid',
    borderColor: '#25273d1a',
    borderRadius: '0px',
  },
  underlineActive: {
    color: 'primary',
    borderColor: 'primary',
  },
}

export function Tab({ section, variant, hash, tag, onClick }: TabProps) {
  function isSelected(section: Omit<TabSection, 'content'>) {
    return `#${section.value}` === hash
  }

  return (
    <Button
      key={section.value}
      variant={'tab'}
      onClick={onClick}
      sx={{
        ...styles[variant],
        ...(variant === 'large' && isSelected(section) ? styles.largeActive : {}),
        ...(variant === 'medium' && isSelected(section) ? styles.mediumActive : {}),
        ...(variant === 'small' && isSelected(section) ? styles.smallActive : {}),
        ...(variant === 'underline' && isSelected(section) ? styles.underlineActive : {}),
      }}
    >
      {section.label}
      {variant === 'underline' && tag?.include && <VaultTabTag isEnabled={tag.active} />}
    </Button>
  )
}
