import React from 'react'
import { Box, Text } from 'theme-ui'

export interface HeadlineDetailsProp {
  label: string
  value: string | number
  sub?: string | string[]
  subColor?: string | string[]
}

export function VaultHeadlineDetails({ label, value, sub, subColor }: HeadlineDetailsProp) {
  return (
    <Box
      sx={{
        position: 'relative',
        fontSize: 3,
        mt: [2, 0],
        ml: [0, 3],
        pl: [0, 3],
        '::before': {
          content: ['none', '""'],
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          height: '16px',
          margin: 'auto',
          backgroundColor: 'neutral60',
        },
        ':first-child': {
          ml: 0,
          pl: 0,
          '::before': {
            content: 'none',
          },
        },
      }}
    >
      <Text as="span" sx={{ color: 'neutral80' }}>
        {label}
      </Text>
      <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold', color: 'primary100' }}>
        {value}
      </Text>
      {typeof sub === 'string' && subColor && (
        <Text as="span" sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor }}>
          {sub}
        </Text>
      )}
      {Array.isArray(sub) &&
        Array.isArray(subColor) &&
        sub.map((arrSub, arrSubIndex) => (
          <Text
            key={arrSub}
            as="span"
            sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor[arrSubIndex] }}
          >
            {arrSub}
          </Text>
        ))}
    </Box>
  )
}
