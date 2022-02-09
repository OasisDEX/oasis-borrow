import React, { useEffect } from 'react'
import { Grid } from 'theme-ui'

import { IlkDataList } from '../../blockchain/ilks'
import { GuniTempBanner } from '../../features/banners/guniTempBanner'
import { VaultBannersView } from '../../features/banners/VaultsBannersView'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { GeneralManageVaultView } from '../../features/generalManageVault/GeneralManageVaultView'
import { TabSwitchLayout, VaultViewMode } from '../TabSwitchLayout'
import { DefaultVaultHeaderControl } from './DefaultVaultHeaderControl'
import { HistoryControl } from './HistoryControl'
import { ProtectionControl } from './ProtectionControl'

interface GeneralManageAnalyticsProps {
  generalManageVault: GeneralManageVaultState
  ilkDataList: IlkDataList
}

export function GeneralManageLayout({
  generalManageVault,
  ilkDataList,
}: GeneralManageAnalyticsProps) {
  const vaultId = generalManageVault.state.vault.id

  useEffect(() => {
    return () => {
      generalManageVault.state.clear()
    }
  }, [])

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultBannersView id={vaultId} />
      <GuniTempBanner id={vaultId} />
      {/*
              <TabSwitcher tabs={[
                {
                  tabLabel: 'Overview',
                  tabContent: (
                    <GeneralManageVaultView id={vaultId} />
                  )
                },
                {
                  tabLabel: 'Protection',
                  tabContent: (
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
                  )
                },
                {
                  tabLabel: 'History',
                  tabContent: (
                    <h1>TODO History</h1>
                  )
                }

              ]} narrowTabsSx={null} wideTabsSx={null} /> */}

      {/* TODO Replace with TabSwitcher ~ŁW */}
      <TabSwitchLayout
        defaultMode={VaultViewMode.Overview}
        headerControl={
          <DefaultVaultHeaderControl
            vault={generalManageVault.state.vault}
            ilkDataList={ilkDataList}
          />
        }
        overViewControl={<GeneralManageVaultView generalManageVault={generalManageVault} />}
        historyControl={<HistoryControl generalManageVault={generalManageVault} />}
        protectionControl={
          <ProtectionControl vault={generalManageVault.state.vault} ilkDataList={ilkDataList} />
        }
      />
    </Grid>
  )
}
