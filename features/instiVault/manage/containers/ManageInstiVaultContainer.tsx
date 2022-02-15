import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'

import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'
import { ManageInstiVaultForm } from './ManageInstiVaultForm'
import { ManageInstiVaultHeader } from './ManageInstiVaultHeader'


export function ManageInstiVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData
  } = manageVault
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <ManageInstiVaultHeader header={t('vault.insti-header', { ilk, id })} id={id} ilkData={ilkData} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageInstiVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <ManageInstiVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}