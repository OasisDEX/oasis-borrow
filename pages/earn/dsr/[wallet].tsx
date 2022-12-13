import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AppLayout } from 'components/Layouts'
import { DsrViewContainer } from 'features/dsr/containers/DsrViewContainer'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { GetServerSidePropsContext } from 'next'
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
  return (
    <WithFeatureToggleRedirect feature="DaiSavingsRate">
      <WithConnection>
        <WithTermsOfService>
          <WithWalletAssociatedRisk>
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
