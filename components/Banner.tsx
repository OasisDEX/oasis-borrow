import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, IconButton, SxProps } from 'theme-ui'

type Closable = {
  close: React.MouseEventHandler<any>
  sx?: SxProps
}
type BannerProps = WithChildren & Closable

export function Banner({ children, close, sx }: BannerProps) {
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
        ...sx,
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
      <Box sx={{ wordBreak: 'break-all' }}>{children}</Box>
    </Box>
  )
}
