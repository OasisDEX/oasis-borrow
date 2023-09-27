import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { currentContent } from 'features/content'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function TermsPage() {
  return (
    <MarketingLayout topBackground="lighter" variant="termsContainer">
      <PageSEONoFollow />
      <Box sx={{ width: '100%', position: 'relative' }}>{currentContent.tos.content}</Box>
    </MarketingLayout>
  )
}

export default TermsPage
