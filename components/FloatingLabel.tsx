import React from 'react'
import { Flex, SxStyleProp, Text } from 'theme-ui'

interface FloatingLabelProps {
  text: string
  variant?: 'primary'
  flexSx?: SxStyleProp
  textSx?: SxStyleProp
}

export function FloatingLabel({ text, flexSx = {}, textSx = {} }: FloatingLabelProps) {
  return (
    <Flex
      sx={{
        borderRadius: '14px',
        height: '28px',
        py: 1,
        px: 3,
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: '#5C5FFE',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.25)',
        ...flexSx,
      }}
    >
      <Text sx={{ color: 'text.contrast', fontSize: 1, fontWeight: 'heading', ...textSx }}>
        {text}
      </Text>
    </Flex>
  )
}
