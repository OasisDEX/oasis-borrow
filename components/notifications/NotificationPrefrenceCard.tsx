import React from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'
import { Toggle } from 'ui'

interface NotificationPrefrenceCardPtops {
  heading: string
  description: string
  checked: boolean
  // TODO: Make this required prop
  onChangeHandler?: () => void
}

export function NotificationPrefrenceCard({
  heading,
  description,
  checked,
  onChangeHandler,
}: NotificationPrefrenceCardPtops) {
  return (
    <Card
      sx={{
        border: 'none',
        padding: '8px',
        mt: 3,
      }}
    >
      <Flex>
        <Text
          sx={{
            fontWeight: 500,
            marginRight: 'auto',
            fontSize: '14px',
          }}
        >
          {heading}
        </Text>
        <Toggle
          isChecked={checked}
          onChangeHandler={onChangeHandler}
          sx={{
            transition: '0.4s',
          }}
        />
      </Flex>
      <Box
        sx={{
          pr: '40px',
        }}
      >
        <Text
          sx={{
            color: '#787A9B',
            fontSize: '14px',
          }}
        >
          {description}
        </Text>
      </Box>
    </Card>
  )
}
