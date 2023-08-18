import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AjnaPoolCreatorController } from 'features/ajna/common/controls/AjnaPoolCreatorController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaPoolCreatorPage() {
  return (
    <WithTermsOfService>
      <WithWalletAssociatedRisk>
        <WithFeatureToggleRedirect feature="AjnaPoolFinder">
          <AjnaPoolCreatorController />
        </WithFeatureToggleRedirect>
      </WithWalletAssociatedRisk>
    </WithTermsOfService>
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
