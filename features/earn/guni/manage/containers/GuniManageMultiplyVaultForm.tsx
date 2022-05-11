import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyContentBox, VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import React from 'react'

import { ManageMultiplyVaultButton } from '../../../../../components/vault/commonMultiply/ManageMultiplyVaultButton'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from '../../../../../components/vault/commonMultiply/ManageMultiplyVaultConfirmation'
import { ManageVaultCollateralAllowance } from '../../../../../components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from '../../../../../components/vault/commonMultiply/ManageVaultDaiAllowance'
import { extractGasDataFromState } from '../../../../../helpers/extractGasDataFromState'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'
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

  const gasData = extractGasDataFromState(props)

  const shouldDisplayActionButton =
    accountIsConnected &&
    (accountIsController ||
      (!accountIsController &&
        stage !== 'adjustPosition' &&
        (otherAction === 'depositCollateral' || otherAction === 'paybackDai')))
  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <GuniManageMultiplyVaultFormHeader {...props} />
      {isProxyStage && <VaultProxyContentBox stage={stage} gasData={gasData} />}
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
          {stage !== 'adjustPosition' && <ManageMultiplyVaultButton {...props} />}
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
