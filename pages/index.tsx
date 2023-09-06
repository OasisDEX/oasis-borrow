import React from 'react'
import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context'
import { LandingPageLayout } from 'components/layouts'
import { HomepageView } from 'features/homepage/HomepageView'
import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function LandingPage() {
  return (
    <FunctionalContextHandler>
      <WithConnection>
        <HomepageView />
        <Survey for="homepage" />
      </WithConnection>
    </FunctionalContextHandler>
  )
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'

export default LandingPage
