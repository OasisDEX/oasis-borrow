import React from 'react'

import { VaultAllowanceStatus } from '../../../../../components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from '../../../../../components/vault/VaultChangesWithADelayCard'
import { VaultFormContainer } from '../../../../../components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from '../../../../../components/vault/VaultProxy'
import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { ManageMultiplyVaultButton } from '../../../common/ManageMultiplyVaultButton'
import { ManageMultiplyVaultCollateralAllowance } from '../../../common/ManageMultiplyVaultCollateralAllowance'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from '../../../common/ManageMultiplyVaultConfirmation'
import { ManageMultiplyVaultDaiAllowance } from '../../../common/ManageMultiplyVaultDaiAllowance'
import { VaultErrors } from '../../../common/VaultErrors'
import { VaultWarnings } from '../../../common/VaultWarnings'
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
      {isCollateralAllowanceStage && <ManageMultiplyVaultCollateralAllowance {...props} />}
      {isDaiAllowanceStage && <ManageMultiplyVaultDaiAllowance {...props} />}
      {isManageStage && <ManageMultiplyVaultConfirmation {...props} />}
      {shouldDisplayActionButton && (
        <>
          <VaultErrors
            {...props}
            errorMessagesToPick={[
              // TODO check what errors needed
              'depositAmountExceedsCollateralBalance',
              'withdrawAmountExceedsFreeCollateral',
              'withdrawAmountExceedsFreeCollateralAtNextPrice',
              'generateAmountExceedsDaiYieldFromTotalCollateral',
              'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
              'generateAmountExceedsDebtCeiling',
              'generateAmountMoreThanMaxFlashAmount',
              'generateAmountLessThanDebtFloor',
              'paybackAmountExceedsDaiBalance',
              'paybackAmountExceedsVaultDebt',
              'debtWillBeLessThanDebtFloor',
              'customCollateralAllowanceAmountExceedsMaxUint256',
              'customCollateralAllowanceAmountLessThanDepositAmount',
              'customDaiAllowanceAmountExceedsMaxUint256',
              'customDaiAllowanceAmountLessThanPaybackAmount',
              'depositingAllEthBalance',
              'ledgerWalletContractDataDisabled',
              'shouldShowExchangeError',
              'hasToDepositCollateralOnEmptyVault',
              'withdrawCollateralOnVaultUnderDebtFloor',
            ]}
          />
          <VaultWarnings
            {...props}
            warningMessagesToPick={[
              // TODO check what warnings needed
              'potentialGenerateAmountLessThanDebtFloor',
              'debtIsLessThanDebtFloor',
              'vaultWillBeAtRiskLevelDanger',
              'vaultWillBeAtRiskLevelWarning',
              'vaultWillBeAtRiskLevelDangerAtNextPrice',
              'vaultWillBeAtRiskLevelWarningAtNextPrice',
            ]}
          />
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
