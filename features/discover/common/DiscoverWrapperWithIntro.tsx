import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { useAjnaProductDetailsContext } from 'features/ajna/contexts/AjnaProductDetailsContext'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

export function DiscoverWrapperWithIntro({ children }: WithChildren) {
  const { t } = useTranslation()
  const context = useAjnaProductDetailsContext('borrow')

  console.log(context)
  console.log(context.position)
  console.log(context.position.foo)
  console.log(context.position.borrow)

  return (
    <Box sx={{ width: '100%', mt: [0, 5] }}>
      <Box sx={{ mb: ['48px', 5], textAlign: 'center' }}>
        <Heading variant="header2" sx={{ mb: 2 }}>
          {t('discover.heading')}
        </Heading>
        <Text variant="paragraph1" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
          {t('discover.intro')}{' '}
          <AppLink href="https://kb.oasis.app/help/learn-more-about-discover">
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
