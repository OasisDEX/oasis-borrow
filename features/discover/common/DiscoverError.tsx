import { DiscoverDataResponseError } from 'features/discover/api'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function DiscoverError({ error }: { error?: DiscoverDataResponseError }) {
  const { t } = useTranslation()

  return (
    <Text
      as="p"
      variant="paragraph2"
      sx={{
        px: ['24px', null, null, 4],
        py: 4,
      }}
    >
      {t(`discover.api-error.${error?.code}`)}
    </Text>
  )
}
