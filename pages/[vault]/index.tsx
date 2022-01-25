import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { TabSwitcher } from 'components/TabSwitcher'
import { TabSwitchLayout, VaultViewMode } from 'components/TabSwitchLayout'
import { DefaultVaultHeaderControl } from 'components/vault/DefaultVaultHeaderControl'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { AdjustSlFormControl } from 'features/automation/controls/AdjustSlFormControl'
import { ProtectionDetailsControl } from 'features/automation/controls/ProtectionDetailsControl'
import { GuniTempBanner } from 'features/banners/guniTempBanner'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

export default function Vault({ id }: { id: string }) {
  console.log('rendering index')
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
              <GuniTempBanner id={vaultId} />

              <TabSwitcher
                tabs={[{
                  tabLabel:'Overview',
                  tabContent:(<GeneralManageVaultView id={vaultId} />)
                },{
                  tabLabel:'History',
                  tabContent:(<h1>TODO History</h1>)
                },{
                  tabLabel:'Protection',
                  tabContent:(<DefaultVaultLayout
                    detailsViewControl={<ProtectionDetailsControl id={vaultId} />}
                    editForm={<AdjustSlFormControl id={vaultId} />}
                    headerControl={<DefaultVaultHeaderControl vaultId={vaultId} />}
                  />)
                }]}
                narrowTabsSx={{
                  display: ['block', 'none'],
                  maxWidth: '343px',
                  width: '100%',
                  mb: 4,
                }}
                wideTabsSx={{ display: ['none', 'block'], mb: 5 }}
              />
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
