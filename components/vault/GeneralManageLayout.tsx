import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Grid } from 'theme-ui'

import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultViewAutomation } from '../../features/generalManageVault/GeneralManageVaultView'
import { TabSwitchLayout, VaultViewMode } from '../TabSwitchLayout'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
import { HistoryControl } from './HistoryControl'
import { ProtectionControl } from './ProtectionControl'

interface GeneralManageAnalyticsProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageLayout({ generalManageVault }: GeneralManageAnalyticsProps) {
  const vaultId = generalManageVault.state.vault.id
  const { t } = useTranslation()
  useEffect(() => {
    return () => {
      generalManageVault.state.clear()
    }
  }, [])

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultBannersView id={vaultId} />
      <TabSwitchLayout
        defaultMode={VaultViewMode.Overview}
        heading={t('vault.header', { ilk: generalManageVault.state.ilkData.ilk, id: vaultId })}
        headerControl={
          <DefaultVaultHeaderControl
            vault={generalManageVault.state.vault}
            ilkData={generalManageVault.state.ilkData}
          />
        }
        overViewControl={
          <GeneralManageVaultViewAutomation generalManageVault={generalManageVault} />
        }
        historyControl={<HistoryControl generalManageVault={generalManageVault} />}
        protectionControl={
          <ProtectionControl
            vault={generalManageVault.state.vault}
            ilkData={generalManageVault.state.ilkData}
            account={generalManageVault.state.account}
          />
        }
      />
    </Grid>
  )
}
