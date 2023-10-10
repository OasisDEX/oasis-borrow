import type { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'

interface NoticeCardProps {
  messages: (TranslateStringType | JSX.Element)[]
  type: 'error' | 'warning' | 'ok' | 'notice'
  withBullet?: boolean
  handleClick?: () => void
}

const cardStyles = {
  error: {
    cardVariant: 'danger',
    textColor: 'critical100',
  },
  warning: {
    cardVariant: 'warning',
    textColor: 'warning100',
  },
  notice: {
    cardVariant: 'notice',
    textColor: 'primary100',
  },
  ok: {
    cardVariant: 'ok',
    textColor: 'success100',
  },
} as const

export function MessageCard({ messages, type, withBullet = true, handleClick }: NoticeCardProps) {
  const cardStyle = cardStyles[type]

  if (!messages.length) return null
  return (
    <Card
      variant={cardStyle.cardVariant}
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
              <Text pr={2} sx={{ fontSize: 2, color: cardStyle.textColor }}>
                •
              </Text>
            )}
            <Text sx={{ fontSize: 2, color: cardStyle.textColor }}>{message}</Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  )
}
