import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function SecurityPage() {
  useScrollToTop()
  return <Box sx={{ width: '100%', mt: 5, pb: 7 }}>security</Box>
}

SecurityPage.layout = MarketingLayout
SecurityPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'marketingSmallContainer',
}
SecurityPage.seoTags = (
  <PageSEOTags title="seo.security.title" description="seo.security.description" url="/security" />
)
SecurityPage.theme = 'Landing'

export default SecurityPage
