import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import React, { useState } from 'react'

import { ManageMultiplyVaultButton } from '../../../../components/vault/commonMultiply/ManageMultiplyVaultButton'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from '../../../../components/vault/commonMultiply/ManageMultiplyVaultConfirmation'
import { ManageVaultCollateralAllowance } from '../../../../components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from '../../../../components/vault/commonMultiply/ManageVaultDaiAllowance'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { StopLossTriggeredFormControl } from '../../../automation/controls/StopLossTriggeredFormControl'
import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'
import { ManageMultiplyVaultBorrowTransition } from './ManageMultiplyVaultBorrowTransition'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultEditing } from './ManageMultiplyVaultEditing'
import { ManageMultiplyVaultFormHeader } from './ManageMultiplyVaultFormHeader'

export function ManageMultiplyVaultForm(props: ManageMultiplyVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    isBorrowTransitionStage,
    accountIsConnected,
    accountIsController,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
    stage,
    otherAction,
    vaultHistory,
    stopLossTriggered,
    toggle,
  } = props

  const [reopenPositionClicked, setReopenPositionClicked] = useState(false)
  const automationEnabled = useFeatureToggle('Automation')
  const shouldDisplayActionButton =
    accountIsConnected &&
    (accountIsController ||
      (!accountIsController &&
        stage !== 'adjustPosition' &&
        (otherAction === 'depositCollateral' || otherAction === 'depositDai')))

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      {stopLossTriggered && !reopenPositionClicked && automationEnabled ? (
        <StopLossTriggeredFormControl
          vaultHistory={vaultHistory}
          onClick={() => {
            setReopenPositionClicked(true)
            toggle && toggle('otherActions')
          }}
        />
      ) : (
        <>
          <ManageMultiplyVaultFormHeader {...props} />
          {isEditingStage && <ManageMultiplyVaultEditing {...props} />}
          {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
          {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
          {isManageStage && (
            <ManageMultiplyVaultConfirmation {...props}>
              {(state) => <ManageMultiplyVaultChangesInformation {...state} />}
            </ManageMultiplyVaultConfirmation>
          )}
          {isBorrowTransitionStage && <ManageMultiplyVaultBorrowTransition {...props} />}
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
        </>
      )}
    </VaultFormContainer>
  )
}
