import {
  getGradientColor,
  summerBrandGradient,
  summerFadedBrandGradient,
} from 'helpers/getGradientColor'
import type { FC } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Text } from 'theme-ui'

interface BrandTagProsp {
  sx?: ThemeUIStyleObject
}

export const BrandTag: FC<BrandTagProsp> = ({ children, sx }) => (
  <Box
    as="span"
    sx={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      height: '28px',
      px: '12px',
      background: summerFadedBrandGradient,
      borderRadius: 'roundish',
      verticalAlign: 'bottom',
      ...sx,
      '*&::before': {
        content: '""',
        position: 'absolute',
        top: '1px',
        left: '1px',
        bottom: '1px',
        right: '1px',
        background: 'neutral10',
        borderRadius: 'roundish',
      },
    }}
  >
    <Text
      variant="paragraph4"
      sx={{ position: 'relative', ...getGradientColor(summerBrandGradient) }}
    >
      {children}
    </Text>
  </Box>
)
