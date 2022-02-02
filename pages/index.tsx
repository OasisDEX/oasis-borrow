import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { LandingPageLayout } from 'components/Layouts'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { HomepageView } from '../features/homepage/HomepageView'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function LandingPage() {
  return (
    <WithConnection>
      <HomepageView />
    </WithConnection>
  )
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'
