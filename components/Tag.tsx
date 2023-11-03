import type { PropsWithChildren } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box } from 'theme-ui'

export const Tag = ({
  children,
  variant = 'tagPrimary',
  sx,
}: PropsWithChildren<{
  variant?:
    | 'tagPrimary'
    | 'tagSecondary'
    | 'tagWarning'
    | 'tagCritical'
    | 'tagSuccess'
    | 'tagInteractive'
  sx?: ThemeUIStyleObject
}>) => (
  <Box variant={`boxes.${variant}`} sx={sx}>
    {children}
  </Box>
)
