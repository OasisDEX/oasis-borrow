import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { LandingPageLayout } from 'components/layouts/LandingPageLayout'
import { HomepageView } from 'features/homepage/HomepageView'
import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function LandingPage() {
  return (
    <LandingPageLayout>
      <FunctionalContextHandler>
        <WithConnection>
          <HomepageView />
          <Survey for="homepage" />
        </WithConnection>
      </FunctionalContextHandler>
    </LandingPageLayout>
  )
}

export default LandingPage
