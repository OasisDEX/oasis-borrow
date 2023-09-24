import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { WithChildren } from 'helpers/types/With.types'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

export function FaqLayout({
  noTitle = false,
  learnMoreUrl,
  children,
}: { noTitle?: boolean; learnMoreUrl: string } & WithChildren) {
  const { t } = useTranslation()

  return (
    <Box>
      {!noTitle && (
        <Text variant="header5" sx={{ mb: 4 }}>
          {t('system.faq')}
        </Text>
      )}
      <Grid sx={{ py: 1 }}>{children}</Grid>
      <Box sx={{ borderRadius: 'mediumLarge', bg: 'neutral30', p: 3, mt: 4 }}>
        <Box sx={{ maxWidth: '455px' }}>
          <Text variant="paragraph3" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('simulate-faq.learn-more-heading')}
          </Text>
          <Box>
            <Text variant="paragraph3" sx={{ a: { fontWeight: 'normal' } }}>
              <Trans
                i18nKey="simulate-faq.learn-more-body"
                components={[
                  <AppLink href={learnMoreUrl} />,
                  <AppLink href={EXTERNAL_LINKS.DISCORD} />,
                ]}
              />
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
