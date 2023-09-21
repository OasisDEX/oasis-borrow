import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { WithChildren } from 'helpers/types/With.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

export function DiscoverWrapperWithIntro({ children }: WithChildren) {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%', mt: [0, 5] }}>
      <Box sx={{ mb: ['48px', 5], textAlign: 'center' }}>
        <Heading variant="header2" sx={{ mb: 2 }}>
          {t('discover.heading')}
        </Heading>
        <Text variant="paragraph1" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
          {t('discover.intro')}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.DISCOVER}>
            <WithArrow
              sx={{
                display: 'inline-block',
                fontSize: 4,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              {t('discover.intro-link')}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      {children}
    </Box>
  )
}
