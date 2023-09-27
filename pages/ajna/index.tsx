import { WithConnection } from 'components/connectWallet'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaHomepageView } from 'features/homepage/AjnaHomepageView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaLandingPage() {
  return (
    <AjnaLayout>
      <WithConnection>
        <AjnaHomepageView />
      </WithConnection>
    </AjnaLayout>
  )
}

AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
