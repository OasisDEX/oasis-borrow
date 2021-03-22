import { TxHelpers } from 'components/AppContext'
import { zero } from 'helpers/zero'
import {
  ManageVaultChange,
  ManageVaultEditingStage,
  ManageVaultState,
  resetAmountDefaults,
} from './manageVault'
import {
  manageVaultDepositAndGenerate,
  manageVaultWithdrawAndPayback,
} from './manageVaultTransactions'

export function progressEditing(
  {
    errorMessages,
    proxyAddress,
    depositAmount,
    paybackAmount,
    collateralAllowance,
    daiAllowance,
    token,
  }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
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
      change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
    } else if (!hasCollateralAllowance) {
      change({ kind: 'stage', stage: 'collateralAllowanceWaitingForConfirmation' })
    } else if (!hasDaiAllowance) {
      change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
    } else change({ kind: 'stage', stage: 'manageWaitingForConfirmation' })
  }
}

export function toggleEditing(
  { stage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  const currentEditing = stage
  const otherEditing = (['collateralEditing', 'daiEditing'] as ManageVaultEditingStage[]).find(
    (editingStage) => editingStage !== currentEditing,
  ) as ManageVaultEditingStage

  change({ kind: 'stage', stage: otherEditing })
  change({ kind: 'originalEditingStage', originalEditingStage: otherEditing })
  resetAmountDefaults(change)
}

export function resetBackToEditingStage(
  { originalEditingStage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  resetAmountDefaults(change)
  change({ kind: 'stage', stage: originalEditingStage })
}

export function progressProxy(
  {
    originalEditingStage,
    depositAmount,
    paybackAmount,
    collateralAllowance,
    daiAllowance,
    token,
  }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
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
    change({ kind: 'stage', stage: 'collateralAllowanceWaitingForConfirmation' })
  } else if (!hasDaiAllowance) {
    change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
  } else change({ kind: 'stage', stage: originalEditingStage })
}

export function progressCollateralAllowance(
  { originalEditingStage, paybackAmount, daiAllowance }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
  const paybackAmountLessThanDaiAllowance =
    daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount)
  const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

  if (!hasDaiAllowance) {
    change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
  } else change({ kind: 'stage', stage: originalEditingStage })
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
