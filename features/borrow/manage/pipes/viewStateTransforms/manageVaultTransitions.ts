import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type { VaultActionsLogicInterface } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { defaultMutableManageVaultState } from 'features/borrow/manage/pipes/manageVault.constants'
import type {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from 'features/borrow/manage/pipes/manageVault.types'
import type { ManageVaultEditingStage } from 'features/borrow/manage/pipes/types/ManageBorrowVaultStage.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'

import { defaultManageVaultCalculations } from './manageVaultCalculations.constants'
import { defaultManageVaultConditions } from './manageVaultConditions.constants'
import { manageVaultFormDefaults } from './manageVaultForm.constants'
import {
  depositAndGenerateDefaults,
  paybackAndWithdrawDefaults,
} from './manageVaultInput.constants'
import {
  manageVaultDepositAndGenerate,
  manageVaultWithdrawAndPayback,
} from './manageVaultTransactions'

export function applyManageVaultTransition<VaultState extends ManageStandardBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  if (change.kind === 'toggleEditing') {
    const { stage } = state

    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: change.stage,
      originalEditingStage:
        change.stage === 'multiplyTransitionEditing'
          ? (stage as ManageVaultEditingStage)
          : change.stage,
    }
  }

  if (change.kind === 'backToEditing') {
    const { originalEditingStage } = state
    return {
      ...state,
      stage: originalEditingStage,
    }
  }

  if (change.kind === 'regressCollateralAllowance') {
    const { originalEditingStage, stage } = state

    return {
      ...state,
      ...(stage === 'collateralAllowanceFailure'
        ? { stage: 'collateralAllowanceWaitingForConfirmation' }
        : {
            stage: originalEditingStage,
            collateralAllowanceAmount: maxUint256,
            selectedCollateralAllowanceRadio: 'unlimited',
          }),
    }
  }

  if (change.kind === 'regressDaiAllowance') {
    const { originalEditingStage, stage } = state

    return {
      ...state,
      ...(stage === 'daiAllowanceFailure'
        ? { stage: 'daiAllowanceWaitingForConfirmation' }
        : {
            stage: originalEditingStage,
            daiAllowanceAmount: maxUint256,
            selectedDaiAllowanceRadio: 'unlimited',
          }),
    }
  }

  if (change.kind === 'resetToEditing') {
    const { originalEditingStage } = state
    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: originalEditingStage,
    }
  }

  if (change.kind === 'progressEditing') {
    const {
      errorMessages,
      proxyAddress,
      depositAmount,
      paybackAmount,
      collateralAllowance,
      daiAllowance,
      vault: { token, debtOffset },
    } = state
    const canProgress = !errorMessages.length
    const hasProxy = !!proxyAddress

    const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)

    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))

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

  if (change.kind === 'progressProxy') {
    const {
      originalEditingStage,
      depositAmount,
      paybackAmount,
      collateralAllowance,
      daiAllowance,
      vault: { token, debtOffset },
    } = state
    const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)
    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))
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

  if (change.kind === 'progressCollateralAllowance') {
    const {
      originalEditingStage,
      paybackAmount,
      daiAllowance,
      vault: { debtOffset },
    } = state
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))
    const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

    if (!hasDaiAllowance) {
      return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    }
    return { ...state, stage: originalEditingStage }
  }

  if (change.kind === 'progressMultiplyTransition') {
    return {
      ...state,
      stage: 'multiplyTransitionWaitingForConfirmation',
    }
  }

  if (change.kind === 'multiplyTransitionInProgress') {
    return {
      ...state,
      stage: 'multiplyTransitionInProgress',
    }
  }

  if (change.kind === 'multiplyTransitionFailure') {
    return {
      ...state,
      stage: 'multiplyTransitionFailure',
    }
  }

  if (change.kind === 'multiplyTransitionSuccess') {
    return {
      ...state,
      stage: 'multiplyTransitionSuccess',
    }
  }

  if (change.kind === 'clear') {
    return {
      ...state,
      ...defaultMutableManageVaultState,
      ...defaultManageVaultCalculations,
      ...defaultManageVaultConditions,
      ...depositAndGenerateDefaults,
      ...paybackAndWithdrawDefaults,
    }
  }

  return state
}

export function progressManage(
  txHelpers$: Observable<TxHelpers>,
  state: ManageStandardBorrowVaultState,
  change: (ch: ManageVaultChange) => void,
  proxyActions: VaultActionsLogicInterface,
) {
  const { depositAmount, generateAmount } = state
  const isDepositAndGenerate = depositAmount || generateAmount

  if (isDepositAndGenerate) {
    return manageVaultDepositAndGenerate(txHelpers$, change, state, proxyActions)
  } else {
    return manageVaultWithdrawAndPayback(txHelpers$, change, state, proxyActions)
  }
}
