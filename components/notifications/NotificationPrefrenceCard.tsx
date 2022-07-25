import React from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'
import { Toggle } from 'ui'

interface NotificationPrefrenceCardPtops {
  heading: string
  description: string
  checked: boolean
}

export function NotificationPrefrenceCard({
  heading,
  description,
  checked,
}: NotificationPrefrenceCardPtops) {
  return (
    <Card
      sx={{
        border: 'none',
        padding: 2,
        mt: 3,
      }}
    >
      <Flex>
        <Text
          sx={{
            fontWeight: 'heading',
            marginRight: 'auto',
            fontSize: 2,
          }}
        >
          {heading}
        </Text>
        <Toggle isChecked={checked} />
      </Flex>
      <Box
        sx={{
          pr: '40px',
        }}
      >
        <Text
          sx={{
            color: 'neutral80',
            fontSize: 2,
          }}
        >
          {description}
        </Text>
      </Box>
    </Card>
  )
}
