import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

function DiscoveryPage() {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%', mt: [4, 5], pb: [4, 6] }}>
      <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
        {t('security.heading')}
      </Heading>
      <Text variant="paragraph1" sx={{ color: 'neutral80', textAlign: 'center', mb: 90 }}>
        {t('security.intro')}
      </Text>
    </Box>
  )
}

DiscoveryPage.layout = MarketingLayout
DiscoveryPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
DiscoveryPage.seoTags = (
  <PageSEOTags title="seo.security.title" description="seo.security.description" url="/security" />
)
DiscoveryPage.theme = 'Landing'

export default DiscoveryPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
