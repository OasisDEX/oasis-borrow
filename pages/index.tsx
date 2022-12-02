import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { LandingPageLayout } from 'components/Layouts'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { HomepageView } from '../features/homepage/HomepageView'

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
