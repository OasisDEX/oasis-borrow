import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Grid } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

export default function Vault({ id }: { id: string }) {
  return (
    <WithConnection>
      <WithTermsOfService>
        <Grid gap={0} sx={{ width: '100%' }}>
          <BackgroundLight />
          <VaultBannersView id={new BigNumber(id)} />
          <GeneralManageVaultView id={new BigNumber(id)} />
        </Grid>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout
