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

function CookiePage() {
  return (
    <>
      <PageSEONoFollow />
      <Box>{currentContent.cookie.content}</Box>
    </>
  )
}

CookiePage.layout = MarketingLayout
CookiePage.layoutProps = {
  variant: 'termsContainer',
  topBackground: 'lighter',
}

export default CookiePage
