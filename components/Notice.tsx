import type { PropsWithChildren } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, IconButton } from 'theme-ui'
import { close_squared } from 'theme/icons'

import { Icon } from './Icon'

type Closable = {
  close: React.MouseEventHandler<any>
  sx?: ThemeUIStyleObject
  withClose?: boolean
}

type NoticeProps = PropsWithChildren<Closable>

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
          <Icon icon={close_squared} size={14} />
        </IconButton>
      )}
      <Box>{children}</Box>
    </Box>
  )
}
