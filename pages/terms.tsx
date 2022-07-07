import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { currentContent } from 'features/content'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function TermsPage() {
  const {
    i18n: { language },
  } = useTranslation()

  const Content = currentContent.tos.content[language || 'en']

  return (
    <>
      <PageSEONoFollow />
      <Box sx={{ width: '100%', position: 'relative' }}>
        <Content />
      </Box>
    </>
  )
}

TermsPage.layout = MarketingLayout
TermsPage.layoutProps = {
  variant: 'termsContainer',
}
TermsPage.theme = 'Landing'

export default TermsPage
