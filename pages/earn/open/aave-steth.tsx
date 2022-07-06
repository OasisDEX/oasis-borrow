import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'
import { AaveOpenView } from 'features/earn/aave/open/containers/AaveOpenView'

export async function getStaticProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function OpenVault() {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <AaveOpenView />
        <Survey for="earn" />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout

export default OpenVault