import { WithConnection } from 'components/connectWallet'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaHomepageView } from 'features/homepage/AjnaHomepageView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaLandingPage() {
  return (
    <WithConnection>
      <AjnaWrapper>
        <AjnaHomepageView />
      </AjnaWrapper>
    </WithConnection>
  )
}

AjnaLandingPage.layout = AjnaLayout
AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
