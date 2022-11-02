import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function DomainPage() {
  useScrollToTop()

  return (
    <Box sx={{ width: '100%', mt: [4, 5], pb: [4, 6] }}>
      <Heading variant="header2" sx={{ textAlign: 'center', mb: 2 }}>
        Oasis NFT domains
      </Heading>
      <Text variant="paragraph1" sx={{ color: 'neutral80', textAlign: 'center', mb: 90 }}>
        Mint your own personalized username in .oasis domain.
      </Text>
      Content goes here...
    </Box>
  )
}

DomainPage.layout = MarketingLayout
DomainPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
DomainPage.seoTags = (
  <PageSEOTags title="NFT Domain" description="Claim your NFT domain" url="/domain" />
)
DomainPage.theme = 'Landing'

export default DomainPage
