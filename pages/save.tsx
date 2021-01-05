import { PageSEONoFollow } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { Trans } from 'i18n'
import { LandingPageView } from 'pages'
import React from 'react'
import { Alert, Text } from 'theme-ui'

function SaveNotification() {
  return (
    <Alert variant="warning">
      <Text py={1}>
        <Trans
          i18nKey="landing.notification-save"
          components={[<AppLink href="/contact" sx={{ display: 'inline-block', ml: 1 }} />]}
        />
      </Text>
    </Alert>
  )
}

export default function SavePage() {
  return (
    <>
      <PageSEONoFollow />
      <LandingPageView notification={<SaveNotification />} />
    </>
  )
}

SavePage.layout = MarketingLayout
SavePage.layoutProps = {
  variant: 'landingContainer',
}
SavePage.theme = 'Landing'
