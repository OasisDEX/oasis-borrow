import { trackingEvents } from 'analytics/analytics'
import { useMainContext, useProductContext } from 'components/context'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
// import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
// import { ManageBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
// import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
// import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
// import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageMultiplyVaultDetails } from 'features/multiply/manage/containers/ManageMultiplyVaultDetails'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createManageMultiplyVaultAnalytics$ } from 'features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { SidebarManageMultiplyVault } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVault'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
// import { uiChanges } from 'helpers/uiChanges'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

export function ManageBorrowVaultContainer({
  manageVault,
}: {
  manageVault: ManageMultiplyVaultState
}) {
  const { context$ } = useMainContext()
  const { manageVault$ } = useProductContext()
  const {
    vault: { id, ilk, token },
    clear,
    ilkData,
    priceInfo,
  } = manageVault
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  useEffect(() => {
    const subscription = createManageMultiplyVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !stopLossReadEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!stopLossReadEnabled && (
        <DefaultVaultHeader
          header={t('vault.header', { ilk, id })}
          id={id}
          ilkData={ilkData}
          token={token}
          priceInfo={priceInfo}
        />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageMultiplyVaultDetails
            {...manageVault}
            // onBannerButtonClickHandler={() => {
            //   uiChanges.publish(TAB_CHANGE_SUBJECT, {
            //     type: 'change-tab',
            //     currentMode: VaultViewMode.Protection,
            //   })
            // }}
          />
          {!stopLossReadEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <SidebarManageMultiplyVault {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
