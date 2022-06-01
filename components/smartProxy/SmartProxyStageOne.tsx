import { Box } from '@theme-ui/components'
import { NewListWithIcon } from 'components/NewListWithIcon'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export const smartProxyHeaderConfig = {
  label: 'Edit vault',
  icon: 'edit',
  action: () => {
    alert('Header action clicked')
  },
}

export function SmartProxyStageOne() {
  const { t } = useTranslation()

  return (
    <Box>
      <Text variant="paragraph3" sx={{ position: 'relative', color: 'text.subtitle', mb: 4 }}>
        {t('smart-proxy-desc')}
      </Text>
      <NewListWithIcon
        items={t<string, string[]>('proxy-advantages-new', { returnObjects: true })}
      />
    </Box>
  )
}
