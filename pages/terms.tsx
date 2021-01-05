import { currentContent } from 'components/content'
import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { useTranslation } from 'i18n'
import React from 'react'
import { Box } from 'theme-ui'

export default function TermsPage() {
  const {
    i18n: { language },
  } = useTranslation()

  const Content = currentContent.tos.content[language || 'en']

  return (
    <>
      <PageSEONoFollow />
      <Box sx={{ width: '100%' }}>
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
