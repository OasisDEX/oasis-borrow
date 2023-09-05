import { trackingEvents } from 'analytics/analytics'
import { useMainContext, useProductContext } from 'components/context'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { ManageVaultDetails } from 'features/borrow/manage/containers/ManageVaultDetails'
import { ManageBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { SidebarManageBorrowVault } from 'features/borrow/manage/sidebars/SidebarManageBorrowVault'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

export function ManageBorrowVaultContainer({
  manageVault,
}: {
  manageVault: ManageBorrowVaultState
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
    const subscription = createManageVaultAnalytics$(
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
          <ManageVaultDetails
            {...manageVault}
            onBannerButtonClickHandler={() => {
              // log analytics
            }}
          />
          {!stopLossReadEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <SidebarManageBorrowVault {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
