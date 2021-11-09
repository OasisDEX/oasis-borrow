import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'
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

enum VaultViewMode{
  History=1,
  Protection=2,
  Overview=3
}

export default function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)
  let mode : VaultViewMode = VaultViewMode.Overview;

  
  function handleToggle(newMode: VaultViewMode) {
    mode = newMode;
  }

  return (
    <WithConnection>
      <WithTermsOfService>
        <Grid gap={0} sx={{ width: '100%' }}>
          
        <Grid columns={3} variant="vaultEditingControllerContainer">
          <Button onClick={() => handleToggle(VaultViewMode.Overview)} >
            Overview
          </Button>
          <Button onClick={() => handleToggle(VaultViewMode.Protection)} >
            Protection
          </Button>
          <Button onClick={() => handleToggle(VaultViewMode.History)}>
            History
          </Button>
        </Grid>
          <BackgroundLight />
          {isValidVaultId ? (
            <>
              <VaultBannersView id={vaultId} />
              {mode==VaultViewMode.Overview?
              <GeneralManageVaultView id={vaultId} />
              :"ala ma kota"
              }
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
