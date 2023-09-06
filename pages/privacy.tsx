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

function PrivacyPage() {
  return (
    <>
      <PageSEONoFollow />
      <Box sx={{ width: '100%' }}>{currentContent.privacy.content}</Box>
    </>
  )
}

PrivacyPage.layout = MarketingLayout
PrivacyPage.layoutProps = {
  topBackground: 'lighter',
  variant: 'termsContainer',
}

export default PrivacyPage
