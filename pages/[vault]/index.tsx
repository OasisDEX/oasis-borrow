import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { GeneralManageControl } from '../../components/vault/GeneralManageControl'
import { GeneralManageVaultView } from '../../features/generalManageVault/GeneralManageVaultView'
import { VaultNoticesView } from '../../features/notices/VaultsNoticesView'
import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from '../../features/walletAssociatedRisk/WalletAssociatedRisk'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          {stopLossReadEnabled ? (
            <>
              {isValidVaultId ? (
                <GeneralManageControl id={vaultId} />
              ) : (
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <NotFoundPage />
                </Box>
              )}
            </>
          ) : (
            <Grid gap={0} sx={{ width: '100%' }}>
              {isValidVaultId ? (
                <>
                  <VaultNoticesView id={vaultId} />
                  <GeneralManageVaultView id={vaultId} />
                </>
              ) : (
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <NotFoundPage />
                </Box>
              )}
            </Grid>
          )}
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout

export default Vault
