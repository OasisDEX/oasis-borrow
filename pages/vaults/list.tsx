import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultOverviewView } from 'features/openVaultOverview/OpenVaultOverview'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function VaultsList() {
  return (
    <WithConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <OpenVaultOverviewView />
      </WithTermsOfService>
    </WithConnection>
  )
}

VaultsList.layout = AppLayout
VaultsList.layoutProps = {
  variant: 'daiContainer',
}
