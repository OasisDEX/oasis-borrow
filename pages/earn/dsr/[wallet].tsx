import { ethereumMainnetHexId, NetworkIds } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { DsrViewContainer } from 'features/dsr/containers/DsrViewContainer'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { LendingProtocolLabel } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'
import { FeaturesEnum } from 'types/config'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      walletAddress: ctx.query.wallet || null,
    },
  }
}

function Dsr({ walletAddress }: { walletAddress: string }) {
  const { t } = useTranslation()
  return (
    <AppLayout>
      <ProductContextHandler networkId={NetworkIds.MAINNET}>
        <WithFeatureToggleRedirect feature={FeaturesEnum.DaiSavingsRate}>
          <WithConnection pageChainId={ethereumMainnetHexId} includeTestNet={true}>
            <WithTermsOfService>
              <WithWalletAssociatedRisk>
                <PageSEOTags
                  title="seo.title-dsr"
                  titleParams={{
                    product: t('seo.earn.title'),
                    protocol: LendingProtocolLabel.maker,
                  }}
                  description="seo.multiply.description"
                  url="/earn/dsr"
                />
                <BackgroundLight />
                <DsrViewContainer walletAddress={walletAddress} />
                <Survey for="earn" />
              </WithWalletAssociatedRisk>
            </WithTermsOfService>
          </WithConnection>
        </WithFeatureToggleRedirect>
      </ProductContextHandler>
    </AppLayout>
  )
}

export default Dsr
