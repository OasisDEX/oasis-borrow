import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box } from 'theme-ui'

export const Tag = ({
  children,
  variant = 'tagPrimary',
  sx,
}: WithChildren & {
  variant?:
    | 'tagPrimary'
    | 'tagSecondary'
    | 'tagWarning'
    | 'tagCritical'
    | 'tagSuccess'
    | 'tagInteractive'
  sx?: ThemeUIStyleObject
}) => (
  <Box variant={`boxes.${variant}`} sx={sx}>
    {children}
  </Box>
)
