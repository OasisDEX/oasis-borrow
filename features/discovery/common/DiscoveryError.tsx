import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function DiscoveryError() {
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
      {t('discovery.table.no-entries')}
    </Text>
  )
}
