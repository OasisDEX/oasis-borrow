import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { LandingPageLayout } from 'components/Layouts'
import { LandingView } from 'features/landing/LandingView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { HomepageView } from '../features/homepage/HomepageView'
import { useFeatureToggle } from '../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function LandingPage() {
  const enabled = useFeatureToggle('AssetLandingPages')
  const view = enabled ? <HomepageView /> : <LandingView />
  return <WithConnection>{view}</WithConnection>
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'
