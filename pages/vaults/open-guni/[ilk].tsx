import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenGuniVaultView } from 'features/openGuniVault/components/OpenGuniVaultView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      ilk: ctx.query.ilk || null,
    },
  }
}

export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <OpenGuniVaultView ilk={ilk} />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
