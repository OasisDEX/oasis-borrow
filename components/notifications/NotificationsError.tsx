import React from 'react'
import { Text } from 'theme-ui'

interface EmailErrorProps {
  text: string
}

export function NotificationsError({ text }: EmailErrorProps) {
  return (
    <Text
      as="span"
      sx={{
        fontSize: '12px',
        color: 'critical100',
        fontWeight: 600,
        px: '2px',
        mb: 2,
      }}
    >
      {text}
    </Text>
  )
}
