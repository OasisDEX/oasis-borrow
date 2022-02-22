import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { VaultViewMode } from 'components/TabSwitchLayout'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultChangesInformationEstimatedGasFee } from 'components/vault/VaultChangesInformation'
import { TAB_CHANGE_SUBJECT } from 'features/automation/common/UITypes/TabChange'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { ManageVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultForm } from './ManageVaultForm'

export function ManageVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$, uiChanges } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
  } = manageVault
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !automationEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!automationEnabled && (
        <DefaultVaultHeader header={t('vault.header', { ilk, id })} id={id} ilkData={ilkData} />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageVaultDetails
            {...manageVault}
            onBannerButtonClickHandler={() => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Protection })
            }}
          />
          {!automationEnabled && <VaultHistoryView vaultHistory={vaultHistory} />}
        </Grid>
        <Box>
          <ManageVaultForm
            {...manageVault}
            extraInfo={<VaultChangesInformationEstimatedGasFee {...manageVault} />}
          />
        </Box>
      </Grid>
    </>
  )
}
