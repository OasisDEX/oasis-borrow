import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AjnaPoolCreatorController } from 'features/ajna/common/controls/AjnaPoolCreatorController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaPoolCreatorPage() {
  return (
    <WithFeatureToggleRedirect feature="AjnaPoolFinder">
      <AjnaPoolCreatorController />
    </WithFeatureToggleRedirect>
  )
}

AjnaPoolCreatorPage.layout = AjnaLayout
AjnaPoolCreatorPage.seoTags = ajnaPageSeoTags

export default AjnaPoolCreatorPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
