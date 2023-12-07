import { NetworkIds } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaPoolCreatorController } from 'features/ajna/pool-creator/controls'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { FeaturesEnum } from 'types/config'

function AjnaPoolCreatorPage() {
  return (
    <AjnaLayout>
      <PageSEOTags
        title="seo.ajnaPoolCreator.title"
        description="seo.ajnaPoolCreator.description"
        url={`/ajna/pool-creator`}
      />
      {/* TODO it should be based on url */}
      <ProductContextHandler networkId={NetworkIds.MAINNET}>
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
    </AjnaLayout>
  )
}

AjnaPoolCreatorPage.seoTags = ajnaPageSeoTags

export default AjnaPoolCreatorPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
