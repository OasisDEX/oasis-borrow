import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'

import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageMultiplyVaultButton } from './ManageMultiplyVaultButton'
import { ManageMultiplyVaultEditing } from './ManageMultiplyVaultEditing'
import { ManageMultiplyVaultCollateralAllowance } from './ManageMultiplyVaultCollateralAllowance'
import { ManageMultiplyVaultDaiAllowance } from './ManageMultiplyVaultDaiAllowance'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from './ManageMultiplyVaultConfirmation'
import { ManageMultiplyVaultErrors } from './ManageMultiplyVaultErrors'
import { ManageMultiplyVaultWarnings } from './ManageMultiplyVaultWarnings'
import { ManageMultiplyVaultDetails } from './ManageMultiplyVaultDetails'

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
  } = props

  return (
    <Card variant="vaultFormContainer">
      <Grid gap={4} p={2}>
        <ManageVaultFormHeader {...props} />
        {isEditingStage && <ManageMultiplyVaultEditing {...props} />}
        {isCollateralAllowanceStage && <ManageMultiplyVaultCollateralAllowance {...props} />}
        {isDaiAllowanceStage && <ManageMultiplyVaultDaiAllowance {...props} />}
        {isManageStage && <ManageMultiplyVaultConfirmation {...props} />}
        {accountIsConnected && (
          <>
            <ManageMultiplyVaultErrors {...props} />
            <ManageMultiplyVaultWarnings {...props} />
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
      </Grid>
    </Card>
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
  } = manageVault
  const { t } = useTranslation()

  return (
    <>
      <VaultHeader {...manageVault} header={t('vault.header', { ilk, id })} id={id} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={5} sx={{ order: [3, 1] }}>
          <Box>HELLO FROM MULTIPLY</Box>
          <ManageMultiplyVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
        <Box sx={{ order: [1, 2] }}>
          <ManageMultiplyVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
