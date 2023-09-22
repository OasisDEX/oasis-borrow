import type { DiscoverDataResponseError } from 'features/discover/api'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function DiscoverError({
  error,
  message,
}: {
  error?: DiscoverDataResponseError
  message?: string
}) {
  const { t } = useTranslation()

  return (
    <Text
      as="p"
      variant="paragraph2"
      sx={{
        px: ['24px', null, null, 4],
        py: 4,
        color: 'neutral80',
      }}
    >
      {message}
      {message && error && '<br />'}
      {error && t(`discover.api-error.${error.code}`)}
    </Text>
  )
}
