import { Icon } from 'components/Icon'
import type { FC } from 'react'
import React from 'react'
import { Button } from 'theme-ui'
import { refresh } from 'theme/icons'

interface PoolFinderReplacerProps {
  isVisible: boolean
  onClick: () => void
}

export const PoolFinderReplacer: FC<PoolFinderReplacerProps> = ({ isVisible, onClick }) => {
  return (
    <Button
      variant="tertiary"
      sx={{
        top: '12px',
        right: '33.3%',
        position: 'absolute',
        width: '24px',
        height: '24px',
        mr: '-19px',
        p: 0,
        borderRadius: 'ellipse',
        backgroundColor: 'neutral20',
        lineHeight: 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 100ms',
        ':hover': {
          backgroundColor: 'neutral20',
        },
      }}
      onClick={onClick}
    >
      <Icon icon={refresh} size={16} color="primary100" />
    </Button>
  )
}
