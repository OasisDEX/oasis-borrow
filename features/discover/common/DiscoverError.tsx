import { DiscoverDataErrorResponse } from 'features/discover/api'
import { DiscoverApiErrors } from 'features/discover/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function DiscoverError({ error }: { error?: DiscoverDataErrorResponse }) {
  const { t } = useTranslation()

  return (
    <Text
      as="p"
      variant="paragraph2"
      sx={{
        px: ['24px', null, null, 4],
        py: 4,
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
      }}
    >
      {t(`discover.api-erorr.${error ? error?.code : DiscoverApiErrors.UNKNOWN_ERROR}`)}
    </Text>
  )
}
