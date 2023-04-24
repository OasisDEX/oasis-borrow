import { ProtocolLongNames } from 'blockchain/tokensMetadata'
import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { DsrViewContainer } from 'features/dsr/containers/DsrViewContainer'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

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
    <WithFeatureToggleRedirect feature="DaiSavingsRate">
      <WithConnection>
        <WithTermsOfService>
          <WithWalletAssociatedRisk>
            <PageSEOTags
              title="seo.title-dsr"
              titleParams={{
                product: t('seo.earn.title'),
                protocol: ProtocolLongNames.maker,
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
  )
}

Dsr.layout = AppLayout

export default Dsr
