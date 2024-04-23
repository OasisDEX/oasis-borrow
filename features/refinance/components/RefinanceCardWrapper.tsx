import type { FC } from 'react'
import React from 'react'
import { Card, type ThemeUIStyleObject } from 'theme-ui'

interface RefinanceCardWrapperProps {
  sx?: ThemeUIStyleObject
}

export const RefinanceCardWrapper: FC<RefinanceCardWrapperProps> = ({ children, sx }) => (
  <Card
    sx={{
      backgroundColor: 'neutral30',
      px: '24px',
      py: '28px',
      width: '365px',
      height: 'fit-content',
      ...sx,
    }}
  >
    {children}
  </Card>
)
