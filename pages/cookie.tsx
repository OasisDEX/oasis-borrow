import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { currentContent } from 'features/content'
import { useScrollToTop } from 'helpers/useScrollToTop'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function CookiePage() {
  useScrollToTop()
  return (
    <MarketingLayout variant="termsContainer" topBackground="lighter">
      <PageSEONoFollow />
      <Box>{currentContent.cookie.content}</Box>
    </MarketingLayout>
  )
}

export default CookiePage
