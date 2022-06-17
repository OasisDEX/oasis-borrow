import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { currentContent, TranslatedContent } from 'features/content'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
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
      <Box sx={{ width: '100%' }}>
        <TranslatedContent content={currentContent.privacy} />
      </Box>
    </>
  )
}

PrivacyPage.layout = MarketingLayout
PrivacyPage.layoutProps = {
  variant: 'termsContainer',
}

export default PrivacyPage
