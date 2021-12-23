import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { TabSwitchLayout, VaultViewMode } from 'components/TabSwitchLayout'
import { DefaultVaultHeaderControl } from 'components/vault/DefaultVaultHeaderControl'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { AdjustSlFormControl } from 'features/automation/controls/AdjustSlFormControl'
import { CancelSlFormControl } from 'features/automation/controls/CancelSlFormControl'
import { ProtectionDetailsControl } from 'features/automation/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from 'features/automation/controls/ProtectionFormControl'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box } from 'theme-ui'
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
  console.log('rendering index')
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <BackgroundLight />
        {isValidVaultId ? (
          <Box sx={{ width: '100%' }}>
            <VaultBannersView id={vaultId} />
            <TabSwitchLayout
              defaultMode={VaultViewMode.Overview}
              overViewControl={<GeneralManageVaultView id={vaultId} />}
              historyControl={<h1>TODO History</h1>}
              protectionControl={
                <DefaultVaultLayout
                  detailsViewControl={<ProtectionDetailsControl id={vaultId} />}
                  editForm={
                    <ProtectionFormControl
                      adjustForm={<AdjustSlFormControl id={vaultId} />}
                      cancelForm={<CancelSlFormControl id={vaultId} />}
                    />
                  }
                  headerControl={<DefaultVaultHeaderControl vaultId={vaultId} />}
                />
              }
            />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <NotFoundPage />
          </Box>
        )}
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout
