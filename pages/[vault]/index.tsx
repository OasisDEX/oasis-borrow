import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box, Grid } from 'theme-ui'
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
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <Grid gap={0} sx={{ width: '100%' }}>
          <BackgroundLight />
          {isValidVaultId ? (
            <>
              <VaultBannersView id={vaultId} />
              <ManageVaultView id={vaultId} />
              <VaultHistoryView id={vaultId} />
            </>
          ) : (
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <NotFoundPage />
            </Box>
          )}
        </Grid>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout
