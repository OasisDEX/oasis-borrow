import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'

interface NoticeCardProps {
  messages: string[]
  type: 'error' | 'warning'
}

export function MessageCard({ messages, type }: NoticeCardProps) {
  const cardColor = type === 'error' ? 'danger' : 'warning'
  const textColor = type === 'error' ? 'onError' : 'onWarning'

  if (!messages.length) return null
  return (
    <Card variant={cardColor}>
      <Grid>
        {messages.map((message) => (
          <Flex>
            <Text pr={2} sx={{ fontSize: 2, color: textColor }}>
              •
            </Text>
            <Text sx={{ fontSize: 2, color: textColor }}>{message}</Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  )
}
