import { Box } from '@theme-ui/components'
import { ListWithIcon } from 'components/ListWithIcon'
import { useTranslation } from 'next-i18next'
import { Text } from 'theme-ui'

export const smartProxyHeaderConfig = {
  label: 'Edit vault',
  icon: 'edit',
  action: () => {
    alert('Header action clicked')
  },
}

export function SmartProxyStageOne () {
  const { t } = useTranslation()

  return (
    <Box>
      <Text variant="paragraph3" sx={{ position: 'relative', color: 'text.subtitle', mb: 4 }}>
        {t('smart-proxy-desc')}
      </Text>
      <ListWithIcon items={t<string, string[]>('proxy-advantages', { returnObjects: true })} />
    </Box>
  )
}
