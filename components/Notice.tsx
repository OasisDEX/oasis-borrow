import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, IconButton, SxProps } from 'theme-ui'

type Closable = {
  close: React.MouseEventHandler<any>
  sx?: SxProps
  withClose?: boolean
}

type NoticeProps = WithChildren & Closable

export function Notice({ children, close, sx, withClose = true }: NoticeProps) {
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
      {withClose && (
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
            color: 'neutral80',
            '&:hover': {
              color: 'primary100',
            },
          }}
        >
          <Icon name="close_squared" size={14} />
        </IconButton>
      )}
      <Box sx={{ wordBreak: 'break-all' }}>{children}</Box>
    </Box>
  )
}
