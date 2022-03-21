import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultChangesInformationEstimatedGasFee } from 'components/vault/VaultChangesInformation'
import { VaultViewMode } from 'components/VaultTabSwitch'
import { TAB_CHANGE_SUBJECT } from 'features/automation/common/UITypes/TabChange'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { ManageStandardBorrowVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultForm } from './ManageVaultForm'

export function ManageVaultContainer({
  manageVault,
}: {
  manageVault: ManageStandardBorrowVaultState
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
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Protection,
              })
            }}
          />
          {!automationEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
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
