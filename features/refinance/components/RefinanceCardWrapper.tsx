import type { FC } from 'react'
import React from 'react'
import { Card, type ThemeUIStyleObject } from 'theme-ui'

interface RefinanceCardWrapperProps {
  sx?: ThemeUIStyleObject
}

export const RefinanceCardWrapper: FC<RefinanceCardWrapperProps> = ({ children, sx }) => (
  <Card
    sx={{ backgroundColor: 'neutral30', flex: 1, px: '24px', py: '28px', minWidth: '300px', ...sx }}
  >
    {children}
  </Card>
)
