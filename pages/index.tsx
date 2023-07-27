import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { LandingPageLayout } from 'components/layouts/LandingPageLayout'
import { aaveContext, AaveContextProvider } from 'features/aave'
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
    <AaveContextProvider>
      <DeferedContextProvider context={aaveContext}>
        <WithConnection>
          <HomepageView />
          <Survey for="homepage" />
        </WithConnection>
      </DeferedContextProvider>
    </AaveContextProvider>
  )
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'

export default LandingPage
