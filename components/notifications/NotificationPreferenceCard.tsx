import { Toggle } from 'components/Toggle'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Card, Flex, Text } from 'theme-ui'

interface NotificationPrefrenceCardProps {
  heading: string
  description: string
  checked: boolean
  onChangeHandler: (isEnabled: boolean) => void
  isLoading?: boolean
}

export function NotificationPreferenceCard({
  heading,
  description,
  checked,
  onChangeHandler,
  isLoading,
}: NotificationPrefrenceCardProps) {
  const handleToggle = useCallback(
    (checked) => onChangeHandler(checked),
    [onChangeHandler, checked],
  )
  const { t } = useTranslation()

  return (
    <Card
      as="li"
      sx={{
        p: 2,
        listStyle: 'none',
        border: 'none',
      }}
    >
      <Flex as="h3">
        <Text
          as="span"
          variant="boldParagraph3"
          sx={{
            marginRight: 'auto',
          }}
        >
          {t(heading)}
        </Text>
        <Toggle isChecked={checked} onChange={handleToggle} isLoading={isLoading} />
      </Flex>
      <Text
        as="p"
        sx={{
          pr: 5,
          color: 'neutral80',
          fontSize: 2,
        }}
      >
        {t(description)}
      </Text>
    </Card>
  )
}
