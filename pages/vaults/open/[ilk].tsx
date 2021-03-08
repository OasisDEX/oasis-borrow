import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/openVault/openVaultView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

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
      <OpenVaultView ilk={ilk} />
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
