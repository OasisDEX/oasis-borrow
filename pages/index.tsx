import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { LandingPageLayout } from 'components/Layouts'
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
    <WithConnection>
      <HomepageView />
      <Survey for="homepage" />
    </WithConnection>
  )
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'

export default LandingPage
