import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { LandingPageLayout } from 'components/Layouts'
import { earnContext, EarnContextProvider } from 'features/earn/EarnContextProvider'
import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { HomepageView } from '../features/homepage/HomepageView'

export const getStaticProps = async ({ locale }: { locale: string }) => {
  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(
    'serverSideTranslations(locale, ["common"])',
    JSON.stringify(await serverSideTranslations(locale, ['common']), null, 4),
  )
  console.log(' ')
  console.log(' ')
  console.log(' ')
  console.log(' ')
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

function LandingPage() {
  return (
    <EarnContextProvider>
      <DeferedContextProvider context={earnContext}>
        <WithConnection>
          <HomepageView />
          <Survey for="homepage" />
        </WithConnection>
      </DeferedContextProvider>
    </EarnContextProvider>
  )
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'

export default LandingPage
