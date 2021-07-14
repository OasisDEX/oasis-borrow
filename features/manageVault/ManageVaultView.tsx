import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Grid } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

import { ManageVaultState } from './manageVault'
import { createManageVaultAnalytics$ } from './manageVaultAnalytics'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultCollateralAllowance } from './ManageVaultCollateralAllowance'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultDaiAllowance } from './ManageVaultDaiAllowance'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'
import { ManageVaultErrors } from './ManageVaultErrors'
import { ManageVaultWarnings } from './ManageVaultWarnings'

function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    accountIsConnected,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
  } = props

  return (
    <Card variant="vaultFormContainer">
      <Grid gap={4} p={2}>
        <ManageVaultFormHeader {...props} />
        {isEditingStage && <ManageVaultEditing {...props} />}
        {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
        {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
        {isManageStage && <ManageVaultConfirmation {...props} />}
        {accountIsConnected && (
          <>
            <ManageVaultErrors {...props} />
            <ManageVaultWarnings {...props} />
            <ManageVaultButton {...props} />
          </>
        )}
        {isProxyStage && <VaultProxyStatusCard {...props} />}
        {isCollateralAllowanceStage && (
          <VaultAllowanceStatus
            {...props}
            allowanceTxHash={collateralAllowanceTxHash}
            token={token}
          />
        )}
        {isDaiAllowanceStage && (
          <VaultAllowanceStatus {...props} allowanceTxHash={daiAllowanceTxHash} token={'DAI'} />
        )}
        {isManageStage && <ManageVaultConfirmationStatus {...props} />}
      </Grid>
    </Card>
  )
}

export function ManageVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const {
    vault: { id, ilk },
  } = manageVault
  const { t } = useTranslation()

  return (
    <>
      <VaultHeader {...manageVault} header={t('vault.header', { ilk, id })} id={id} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={5} sx={{ order: [3, 1] }}>
          <ManageVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
        <Box sx={{ order: [1, 2] }}>
          <ManageVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$, vaultHistory$ } = useAppContext()
  const manageVaultWithId$ = manageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(manageVaultWithId$, trackingEvents).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithLoadingIndicator
      value={[manageVaultWithError.value, vaultHistoryWithError.value]}
      error={[manageVaultWithError.error, vaultHistoryWithError.error]}
      customLoader={
        <Box
          sx={{
            position: 'relative',
            height: 600,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AppSpinner sx={{ mx: 'auto', display: 'block' }} variant="styles.spinner.extraLarge" />
        </Box>
      }
    >
      {([manageVault, vaultHistory]) => (
        <Grid sx={{ width: '100%', zIndex: 1, ...slideInAnimation, position: 'relative' }}>
          <ManageVaultContainer {...{ manageVault, vaultHistory }} />
        </Grid>
      )}
    </WithLoadingIndicator>
  )
}
