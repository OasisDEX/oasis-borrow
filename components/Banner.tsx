import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, IconButton } from 'theme-ui'

type Closable = {
  close: React.MouseEventHandler<any>
}
type BannerProps = WithChildren & Closable

export function Banner({ children, close }: BannerProps) {
  return (
    <Box
      sx={{
        bg: 'white',
        width: '100%',
        px: 4,
        py: 3,
        borderRadius: 'mediumLarge',
        boxShadow: 'banner',
        position: 'relative',
        background: 'white',
      }}
    >
      <IconButton
        onClick={close}
        sx={{
          cursor: 'pointer',
          height: 3,
          width: 3,
          padding: 0,
          position: 'absolute',
          top: 3,
          right: 3,
          zIndex: 1,
          color: 'onSurface',
          '&:hover': {
            color: 'primary',
          },
        }}
      >
        <Icon name="close_squared" size={14} />
      </IconButton>
      <Box>{children}</Box>
    </Box>
  )
}
