import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box } from 'theme-ui'

export const BlogPostDot = ({ read, sx }: { read: boolean; sx: ThemeUIStyleObject }) => (
  <Box
    sx={{
      backgroundColor: read ? 'primary30' : 'interactive100',
      width: '6px',
      height: '6px',
      minWidth: '6px',
      minHeight: '6px',
      borderRadius: 'round',
      ...sx,
    }}
  />
)
