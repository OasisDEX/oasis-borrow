import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import {
  VaultChangesInformationEstimatedGasFee,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { VaultIlkDetailsItem } from 'components/vault/VaultHeader'
import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

import { ManageInstiVaultState } from '../../../borrow/manage/pipes/manageVault'
import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'

export function ManageInstiVaultContainer({ manageVault }: { manageVault: ManageInstiVaultState }) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, originationFeePercent, instiIlkName },
    clear,
    ilkData,
    originationFeeUSD,
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
      <DefaultVaultHeader
        header={t('vault.insti-header', { ilk: instiIlkName, id })}
        ilkData={ilkData}
        id={id}
      >
        <VaultIlkDetailsItem
          label={t('manage-insti-vault.origination-fee')}
          value={`${formatPercent(originationFeePercent.times(100), { precision: 2 })}`}
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
          <VaultHistoryView vaultHistory={manageVault.vaultHistory} />
        </Grid>
        <Box>
          <ManageVaultForm
            hideMultiply={true}
            extraInfo={
              <>
                <VaultChangesInformationItem
                  label={t('manage-insti-vault.origination-fee')}
                  value={
                    <Flex>
                      {originationFeeUSD ? `$${formatAmount(originationFeeUSD, 'USD')}` : '$ -- '}
                    </Flex>
                  }
                />
                <VaultChangesInformationEstimatedGasFee {...manageVault} />
              </>
            }
            {...manageVault}
          />
        </Box>
      </Grid>
    </>
  )
}
