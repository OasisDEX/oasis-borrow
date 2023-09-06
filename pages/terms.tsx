import React from 'react'
import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/layouts'
import { currentContent } from 'features/content'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Box } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function TermsPage() {
  return (
    <>
      <PageSEONoFollow />
      <Box sx={{ width: '100%', position: 'relative' }}>{currentContent.tos.content}</Box>
    </>
  )
}

TermsPage.layout = MarketingLayout
TermsPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'termsContainer',
}
TermsPage.theme = 'Landing'

export default TermsPage
