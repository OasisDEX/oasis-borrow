import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ALLOWED_MULTIPLY_TOKENS } from '../../blockchain/tokensMetadata'
import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from '../../features/generalManageVault/GeneralManageVaultView'
import { VaultTabSwitch, VaultViewMode } from '../VaultTabSwitch'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
import { HistoryControl } from './HistoryControl'
import { ProtectionControl } from './ProtectionControl'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageLayout({ generalManageVault }: GeneralManageLayoutProps) {
  const { t } = useTranslation()
  const { ilkData, vault, account } = generalManageVault.state
  const showProtectionTab = ALLOWED_MULTIPLY_TOKENS.includes(vault.token)

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultBannersView id={vault.id} />
      <VaultTabSwitch
        defaultMode={VaultViewMode.Overview}
        heading={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        headerControl={<DefaultVaultHeaderControl vault={vault} ilkData={ilkData} />}
        overViewControl={
          <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />
        }
        historyControl={<HistoryControl generalManageVault={generalManageVault} />}
        protectionControl={<ProtectionControl vault={vault} ilkData={ilkData} account={account} />}
        showProtectionTab={showProtectionTab}
      />
    </Grid>
  )
}
