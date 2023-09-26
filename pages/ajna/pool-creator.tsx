import { WithConnection } from 'components/connectWallet'
import { ProductContextHandler } from 'components/context'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AjnaPoolCreatorController } from 'features/ajna/common/controls/AjnaPoolCreatorController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { FeaturesEnum } from 'types/config'

function AjnaPoolCreatorPage() {
  return (
    <>
      <PageSEOTags
        title="seo.ajnaPoolCreator.title"
        description="seo.ajnaPoolCreator.description"
        url={`/ajna/pool-creator`}
      />
      <ProductContextHandler>
        <WithConnection>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <WithFeatureToggleRedirect feature={FeaturesEnum.AjnaPoolFinder}>
                <AjnaPoolCreatorController />
              </WithFeatureToggleRedirect>
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </WithConnection>
      </ProductContextHandler>
    </>
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
