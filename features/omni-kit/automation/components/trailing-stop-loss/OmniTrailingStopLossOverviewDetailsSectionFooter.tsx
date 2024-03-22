import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Divider, Image, Text } from 'theme-ui'

export const OmniTrailingStopLossOverviewDetailsSectionFooter: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <Box>
        <Text variant="paragraph3" sx={{ color: 'neutral80', mb: 4 }}>
          {t('protection.stop-loss-type-select.trailing-stop-loss-description')}
        </Text>
      </Box>
      <Divider sx={{ my: '24px' }} />
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Image src={staticFilesRuntimeUrl(`/static/img/trailing-stop-loss-graph.svg`)} />
      </Box>
    </>
  )
}
