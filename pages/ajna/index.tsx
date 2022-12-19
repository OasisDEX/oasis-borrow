import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { AnjaHomepageView } from 'features/homepage/AnjaHomepageView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function AjnaLandingPage() {
  return (
    <WithConnection>
      <AjnaWrapper>
        <AnjaHomepageView />
      </AjnaWrapper>
    </WithConnection>
  )
}

AjnaLandingPage.layout = AjnaLayout
AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage
