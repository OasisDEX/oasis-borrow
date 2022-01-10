import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { LandingPageLayout } from 'components/Layouts'
import { LandingView } from 'features/landing/LandingView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Features, useFeatureEnabled } from '../helpers/useFeatureEnabled'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function LandingPage() {
  const enabled = useFeatureEnabled(Features.AssetLandingPages)
  const view = enabled ? 'AssetLandingPages feature enabled ✅' : <LandingView />
  return <WithConnection>{view}</WithConnection>
}

LandingPage.layout = LandingPageLayout
LandingPage.theme = 'Landing'
