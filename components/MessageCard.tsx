import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'

interface NoticeCardProps {
  messages: (string | JSX.Element)[]
  type: 'error' | 'warning'
  withBullet?: boolean
  handleClick?: () => void
}

export function MessageCard({ messages, type, withBullet = true, handleClick }: NoticeCardProps) {
  const cardVariant = type === 'error' ? 'danger' : 'warning'
  const textColor = type === 'error' ? 'critical100' : 'warning100'

  if (!messages.length) return null
  return (
    <Card
      variant={cardVariant}
      onClick={handleClick}
      sx={{
        border: 'none',
        cursor: handleClick ? 'pointer' : 'auto',
      }}
    >
      <Grid>
        {messages.map((message, idx) => (
          <Flex key={idx}>
            {withBullet && (
              <Text pr={2} sx={{ fontSize: 2, color: textColor }}>
                •
              </Text>
            )}
            <Text sx={{ fontSize: 2, color: textColor }}>{message}</Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  )
}
