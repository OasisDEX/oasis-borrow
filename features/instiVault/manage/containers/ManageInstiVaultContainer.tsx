import { trackingEvents } from 'analytics/trackingEvents'
import { ChevronUpDown } from 'components/ChevronUpDown'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import {
  EstimationError,
  getEstimatedGasFeeTextOld,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'

export function ManageInstiVaultContainer({ manageVault }: { manageVault: ManageInstiVaultState }) {
  const { context$ } = useMainContext()
  const { manageVault$ } = useProductContext()
  const {
    vault: { id },
    clear,
    transactionFeeETH,
    originationFeeUSD,
  } = manageVault

  const { t } = useTranslation()
  const [showFees, setShowFees] = useState(false)

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
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageInstiVaultDetails {...manageVault} />
        </Grid>
        <Box>
          <ManageVaultForm
            hideMultiplyTab={true}
            txnCostDisplay={
              <>
                <VaultChangesInformationItem
                  label={t('transaction-fee')}
                  value={
                    <Flex onClick={() => setShowFees((showFees) => !showFees)}>
                      {transactionFeeETH && !transactionFeeETH.isNaN() ? (
                        `${formatAmount(transactionFeeETH, 'ETH')} ETH`
                      ) : (
                        <EstimationError withBrackets={false} />
                      )}
                      <ChevronUpDown isUp={showFees} size="auto" width="12px" sx={{ ml: 2 }} />
                    </Flex>
                  }
                />
                {showFees && (
                  <Grid pl={3} gap={2}>
                    <VaultChangesInformationItem
                      label={t('manage-insti-vault.origination-fee')}
                      value={
                        <Flex>
                          {originationFeeUSD
                            ? `$${formatAmount(originationFeeUSD, 'USD')}`
                            : '$ -- '}
                        </Flex>
                      }
                    />
                    <VaultChangesInformationItem
                      label={t('vault-changes.oasis-fee')}
                      value={<Flex>$0.00</Flex>}
                    />
                    <VaultChangesInformationItem
                      label={'Estimated gas fee'}
                      value={getEstimatedGasFeeTextOld(manageVault)}
                    />
                  </Grid>
                )}
              </>
            }
            {...manageVault}
          />
        </Box>
      </Grid>
    </>
  )
}
