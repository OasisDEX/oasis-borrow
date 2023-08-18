import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AjnaPoolFinderController } from 'features/ajna/common/controls/AjnaPoolFinderController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaPoolFinderPage() {
  return (
    <WithFeatureToggleRedirect feature="AjnaPoolFinder">
      <AjnaPoolFinderController />
    </WithFeatureToggleRedirect>
  )
}

AjnaPoolFinderPage.layout = AjnaLayout
AjnaPoolFinderPage.seoTags = ajnaPageSeoTags

export default AjnaPoolFinderPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
