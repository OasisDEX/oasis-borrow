import React from 'react'
import { Flex, Text } from 'theme-ui'

interface AssetsTableSeparatorProps {
  text?: string
}

export function AssetsTableSeparator({ text }: AssetsTableSeparatorProps) {
  return (
    <Flex
      sx={{
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: '46px',
        bg: 'neutral10',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: '1px',
          my: 'auto',
          bg: 'neutral20',
        },
      }}
    >
      {text && (
        <Text
          variant="paragraph3"
          sx={{ position: 'relative', color: 'primary30', px: 4, bg: 'neutral10' }}
        >
          {text}
        </Text>
      )}
    </Flex>
  )
}
