import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'

import { trackingEvents } from '../../../../analytics/analytics'
import { useAppContext } from '../../../../components/AppContextProvider'
import { VaultHistoryEvent } from '../../../vaultHistory/vaultHistory'
import { ManageVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'

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
      hello insti vault
      {/*<VaultHeader header={manageInstiVault.title} id={manageInstiVault.vault.id}>*/}
      {/*  <VaultIlkDetailsItem*/}
      {/*    label={t('manage-vault.stability-fee')}*/}
      {/*    value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}*/}
      {/*    tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}*/}
      {/*    styles={{*/}
      {/*      tooltip: {*/}
      {/*        left: ['auto', '-20px'],*/}
      {/*        right: ['-0px', 'auto'],*/}
      {/*      },*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</VaultHeader>*/}
      {/*<Grid variant="vaultContainer">*/}
      {/*  <Grid gap={5} mb={[0, 5]}>*/}
      {/*    <ManageVaultDetails {...manageVault} />*/}
      {/*    <VaultHistoryView vaultHistory={vaultHistory} />*/}
      {/*  </Grid>*/}
      {/*  <Box>*/}
      {/*    <ManageVaultForm {...manageVault} />*/}
      {/*  </Box>*/}
      {/*</Grid>*/}
    </>
  )
}
