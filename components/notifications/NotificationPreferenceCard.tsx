import { Toggle } from 'components/Toggle'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'

interface NotificationPrefrenceCardProps {
  heading: string
  description: string
  checked: boolean
  onChangeHandler: (isEnabled: boolean) => void
}

export function NotificationPreferenceCard({
  heading,
  description,
  checked,
  onChangeHandler,
}: NotificationPrefrenceCardProps) {
  const handleToggle = useCallback((checked) => onChangeHandler(checked), [
    onChangeHandler,
    checked,
  ])
  const { t } = useTranslation()

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
          {t(heading)}
        </Text>
        <Toggle
          isChecked={checked}
          onChange={handleToggle}
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
            color: 'neutral80',
            fontSize: 2,
          }}
        >
          {t(description)}
        </Text>
      </Box>
    </Card>
  )
}
