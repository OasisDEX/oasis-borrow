import { trackingEvents } from 'analytics/trackingEvents'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { SidebarManageBorrowVault } from 'features/borrow/manage/sidebars/SidebarManageBorrowVault'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useAppConfig } from 'helpers/config'
import { uiChanges } from 'helpers/uiChanges'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageVaultDetails } from './ManageVaultDetails'

export function ManageVaultContainer({
  manageVault,
}: {
  manageVault: ManageStandardBorrowVaultState
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
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

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
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Protection,
              })
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
