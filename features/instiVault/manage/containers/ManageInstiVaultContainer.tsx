import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'

import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultIlkDetailsItem } from 'components/vault/VaultHeader'
import { formatPercent } from 'helpers/formatters/format'
import { BigNumber } from 'bignumber.js'
import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import { ManageInstiVaultState } from '../pipes/manageVault'


export function ManageInstiVaultContainer({
  manageVault,
  vaultHistory
}: {
  manageVault: ManageInstiVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
    originationFee,
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
      <DefaultVaultHeader header={t('vault.insti-header', { ilk, id })} ilkData={ilkData} id={id}>
        <VaultIlkDetailsItem
            label={t('manage-insti-vault.origination-fee')}
            value={`${formatPercent(originationFee.times(100), { precision: 2 })}`}
            tooltipContent={t('manage-insti-vault.tooltip.origination-fee')}
            styles={{
              tooltip: {
                left: ['-80px', 'auto'],
                right: ['auto', '-32px'],
              },
            }}
          />
      </DefaultVaultHeader>
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageInstiVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <ManageVaultForm isInstiVault={true} {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
