import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageMultiplyVaultButton } from './ManageMultiplyVaultButton'
import { ManageMultiplyVaultCollateralAllowance } from './ManageMultiplyVaultCollateralAllowance'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from './ManageMultiplyVaultConfirmation'
import { ManageMultiplyVaultDaiAllowance } from './ManageMultiplyVaultDaiAllowance'
import { ManageMultiplyVaultDetails } from './ManageMultiplyVaultDetails'
import { ManageMultiplyVaultEditing } from './ManageMultiplyVaultEditing'
import { ManageMultiplyVaultErrors } from './ManageMultiplyVaultErrors'
import { ManageMultiplyVaultFormHeader } from './ManageMultiplyVaultFormHeader'
import { ManageMultiplyVaultWarnings } from './ManageMultiplyVaultWarnings'

function ManageMultiplyVaultForm(props: ManageMultiplyVaultState) {
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
    stage,
  } = props

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <ManageMultiplyVaultFormHeader {...props} />
      {isEditingStage && <ManageMultiplyVaultEditing {...props} />}
      {isCollateralAllowanceStage && <ManageMultiplyVaultCollateralAllowance {...props} />}
      {isDaiAllowanceStage && <ManageMultiplyVaultDaiAllowance {...props} />}
      {isManageStage && <ManageMultiplyVaultConfirmation {...props} />}
      {accountIsConnected && (
        <>
          <ManageMultiplyVaultErrors {...props} />
          <ManageMultiplyVaultWarnings {...props} />
          {stage === 'manageSuccess' && <VaultChangesWithADelayCard />}
          <ManageMultiplyVaultButton {...props} />
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
      {isManageStage && <ManageMultiplyVaultConfirmationStatus {...props} />}
    </VaultFormContainer>
  )
}

export function ManageMultiplyVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageMultiplyVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const {
    vault: { id, ilk },
    clear,
  } = manageVault
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <VaultHeader {...manageVault} header={t('vault.header', { ilk, id })} id={id} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageMultiplyVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <ManageMultiplyVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
