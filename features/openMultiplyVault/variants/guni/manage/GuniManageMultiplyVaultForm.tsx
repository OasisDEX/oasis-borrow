import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import React from 'react'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { ManageMultiplyVaultButton } from '../../../common/ManageMultiplyVaultButton'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from '../../../common/ManageMultiplyVaultConfirmation'
import { ManageVaultCollateralAllowance } from '../../../common/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from '../../../common/ManageVaultDaiAllowance'
import { GuniManageMultiplyVaultChangesInformation } from './GuniManageMultiplyVaultChangesInformation'
import { GuniManageMultiplyVaultEditing } from './GuniManageMultiplyVaultEditing'
import { GuniManageMultiplyVaultFormHeader } from './GuniManageMultiplyVaultFormHeader'

export function GuniManageMultiplyVaultForm(props: ManageMultiplyVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    accountIsConnected,
    accountIsController,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
    stage,
    otherAction,
  } = props

  const shouldDisplayActionButton =
    accountIsConnected &&
    (accountIsController ||
      (!accountIsController &&
        stage !== 'adjustPosition' &&
        (otherAction === 'depositCollateral' || otherAction === 'depositDai')))
  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <GuniManageMultiplyVaultFormHeader {...props} />
      {isEditingStage && <GuniManageMultiplyVaultEditing {...props} />}
      {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
      {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
      {isManageStage && (
        <ManageMultiplyVaultConfirmation {...props}>
          {(state) => <GuniManageMultiplyVaultChangesInformation {...state} />}
        </ManageMultiplyVaultConfirmation>
      )}
      {shouldDisplayActionButton && (
        <>
          <VaultErrors {...props} />
          <VaultWarnings {...props} />
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
