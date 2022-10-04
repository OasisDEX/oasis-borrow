import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

export function DiscoveryWrapperWithIntro({ children }: WithChildren) {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%', mt: [4, 5], pb: [4, 6] }}>
      <Box sx={{ mb: [4, 5], textAlign: 'center' }}>
        <Heading variant="header2" sx={{ mb: 2 }}>
          {t('discovery.heading')}
        </Heading>
        <Text as="p" variant="paragraph1" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
          {t('discovery.intro')}{' '}
          <AppLink href="https://kb.oasis.app/">
            <WithArrow
              sx={{
                display: 'inline-block',
                fontSize: 4,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              {t('discovery.intro-link')}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      {children}
    </Box>
  )
}
