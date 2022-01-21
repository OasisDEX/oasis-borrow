import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      ilk: ctx.query.ilk || null,
    },
  }
}

export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <OpenVaultView ilk={ilk} />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
