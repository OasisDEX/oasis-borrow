import { TxHelpers } from 'components/AppContext'
import { zero } from 'helpers/zero'

import { ManageVaultChange, ManageVaultEditingStage, ManageVaultState } from './manageVault'
import { manageVaultFormDefaults } from './manageVaultForm'
import {
  manageVaultDepositAndGenerate,
  manageVaultWithdrawAndPayback,
} from './manageVaultTransactions'

export enum ManageVaultTransitionKind {
  toggleEditing = 'toggleEditing',
  progressEditing = 'progressEditing',
  progressProxy = 'progressProxy',
  progressCollateralAllowance = 'progressCollateralAllowance',
  backToEditing = 'backToEditing',
  resetToEditing = 'resetToEditing',
}

export type ManageVaultTransitionChange =
  | {
      kind: ManageVaultTransitionKind.toggleEditing
    }
  | {
      kind: ManageVaultTransitionKind.progressEditing
    }
  | {
      kind: ManageVaultTransitionKind.progressProxy
    }
  | {
      kind: ManageVaultTransitionKind.progressCollateralAllowance
    }
  | {
      kind: ManageVaultTransitionKind.backToEditing
    }
  | {
      kind: ManageVaultTransitionKind.resetToEditing
    }

export function applyManageVaultTransition(
  change: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
  if (change.kind === ManageVaultTransitionKind.toggleEditing) {
    const { stage } = state
    const currentEditing = stage
    const otherEditing = (['collateralEditing', 'daiEditing'] as ManageVaultEditingStage[]).find(
      (editingStage) => editingStage !== currentEditing,
    ) as ManageVaultEditingStage
    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: otherEditing,
      originalEditingStage: otherEditing,
    }
  }

  if (change.kind === ManageVaultTransitionKind.backToEditing) {
    const { originalEditingStage } = state
    return {
      ...state,
      stage: originalEditingStage,
    }
  }

  if (change.kind === ManageVaultTransitionKind.resetToEditing) {
    const { originalEditingStage } = state
    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: originalEditingStage,
    }
  }

  if (change.kind === ManageVaultTransitionKind.progressEditing) {
    const {
      errorMessages,
      proxyAddress,
      depositAmount,
      paybackAmount,
      collateralAllowance,
      daiAllowance,
      token,
    } = state
    const canProgress = !errorMessages.length
    const hasProxy = !!proxyAddress

    const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)

    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount)

    const hasCollateralAllowance =
      token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (canProgress) {
      if (!hasProxy) {
        return { ...state, stage: 'proxyWaitingForConfirmation' }
      }
      if (!hasCollateralAllowance) {
        return { ...state, stage: 'collateralAllowanceWaitingForConfirmation' }
      }
      if (!hasDaiAllowance) {
        return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
      }
      return { ...state, stage: 'manageWaitingForConfirmation' }
    }
  }

  if (change.kind === ManageVaultTransitionKind.progressProxy) {
    const {
      originalEditingStage,
      depositAmount,
      paybackAmount,
      collateralAllowance,
      daiAllowance,
      token,
    } = state
    const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)
    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount)
    const hasCollateralAllowance =
      token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero
    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (!hasCollateralAllowance) {
      return { ...state, stage: 'collateralAllowanceWaitingForConfirmation' }
    }
    if (!hasDaiAllowance) {
      return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    }
    return { ...state, stage: originalEditingStage }
  }

  if (change.kind === ManageVaultTransitionKind.progressCollateralAllowance) {
    const { originalEditingStage, paybackAmount, daiAllowance } = state
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount)
    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (!hasDaiAllowance) {
      return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    }
    return { ...state, stage: originalEditingStage }
  }

  return state
}

export function progressManage(
  txHelpers: TxHelpers,
  state: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  const { depositAmount, generateAmount } = state
  const isDepositAndGenerate = depositAmount || generateAmount

  if (isDepositAndGenerate) {
    return manageVaultDepositAndGenerate(txHelpers, change, state)
  } else {
    return manageVaultWithdrawAndPayback(txHelpers, change, state)
  }
}
