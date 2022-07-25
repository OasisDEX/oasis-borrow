import { maxUint256 } from 'blockchain/calls/erc20'
import { Context } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { zero } from 'helpers/zero'
import { Observable } from 'rxjs'

import {
  defaultMutableManageMultiplyVaultState,
  ManageMultiplyVaultChange,
  ManageMultiplyVaultEditingStage,
  ManageMultiplyVaultState,
} from './manageMultiplyVault'
import { defaultManageMultiplyVaultCalculations } from './manageMultiplyVaultCalculations'
import { defaultManageMultiplyVaultConditions } from './manageMultiplyVaultConditions'
import { manageMultiplyInputsDefaults, manageVaultFormDefaults } from './manageMultiplyVaultForm'
import {
  adjustPosition,
  closeVault,
  manageVaultDepositAndGenerate,
  manageVaultWithdrawAndPayback,
} from './manageMultiplyVaultTransactions'

type ManageVaultBorrowTransitionChange =
  | {
      kind: 'progressBorrowTransition'
    }
  | {
      kind: 'borrowTransitionInProgress'
    }
  | {
      kind: 'borrowTransitionFailure'
    }
  | {
      kind: 'borrowTransitionSuccess'
    }

export type ManageVaultTransitionChange =
  | ManageVaultBorrowTransitionChange
  | {
      kind: 'toggleEditing'
      stage: ManageMultiplyVaultEditingStage
    }
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'progressProxy'
    }
  | {
      kind: 'progressCollateralAllowance'
    }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'resetToEditing'
    }
  | {
      kind: 'regressCollateralAllowance'
    }
  | {
      kind: 'regressDaiAllowance'
    }
  | {
      kind: 'clear'
    }

export function applyManageVaultTransition<VS extends ManageMultiplyVaultState>(
  change: ManageMultiplyVaultChange,
  state: VS,
): VS {
  if (change.kind === 'toggleEditing') {
    const { stage } = state

    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: change.stage,
      originalEditingStage:
        change.stage === 'borrowTransitionEditing'
          ? (stage as ManageMultiplyVaultEditingStage)
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
      collateralAllowance,
      daiAllowance,
      vault: { token, debtOffset },
      depositAmount,
      depositDaiAmount,
      paybackAmount,
    } = state
    const canProgress = !errorMessages.length
    const hasProxy = !!proxyAddress
    const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    const isDepositDaiZero = depositDaiAmount ? depositDaiAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)

    const paybackAmountLessThanDaiAllowance =
      daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))

    const depositDaiAmountLessThanDaiAllowance =
      daiAllowance && depositDaiAmount && daiAllowance.gte(depositDaiAmount.plus(debtOffset))

    const hasCollateralAllowance =
      token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero
    const hasDaiAllowance =
      (paybackAmountLessThanDaiAllowance || isPaybackZero) &&
      (depositDaiAmountLessThanDaiAllowance || isDepositDaiZero)

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
      collateralAllowance,
      daiAllowance,
      vault: { token, debtOffset },
      depositAmount,
      paybackAmount,
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

  if (change.kind === 'progressBorrowTransition') {
    return {
      ...state,
      stage: 'borrowTransitionWaitingForConfirmation',
    }
  }

  if (change.kind === 'borrowTransitionInProgress') {
    return {
      ...state,
      stage: 'borrowTransitionInProgress',
    }
  }

  if (change.kind === 'borrowTransitionFailure') {
    return {
      ...state,
      stage: 'borrowTransitionFailure',
    }
  }

  if (change.kind === 'borrowTransitionSuccess') {
    return {
      ...state,
      stage: 'borrowTransitionSuccess',
    }
  }

  if (change.kind === 'clear') {
    return {
      ...state,
      ...defaultMutableManageMultiplyVaultState(state.vault.lockedCollateral),
      ...defaultManageMultiplyVaultCalculations,
      ...defaultManageMultiplyVaultConditions,
      ...manageMultiplyInputsDefaults,
    }
  }

  return state
}

export function progressAdjust(
  txHelpers$: Observable<TxHelpers>,
  context: Context,
  state: ManageMultiplyVaultState,
  change: (ch: ManageMultiplyVaultChange) => void,
) {
  if (state.requiredCollRatio === undefined) {
    if (state.depositAmount !== undefined || state.generateAmount !== undefined) {
      return manageVaultDepositAndGenerate(txHelpers$, change, state)
    }
    if (state.withdrawAmount !== undefined || state.paybackAmount !== undefined) {
      return manageVaultWithdrawAndPayback(txHelpers$, change, state)
    }
    if (state.otherAction === 'closeVault' && state.vault.debt.isZero()) {
      return manageVaultWithdrawAndPayback(txHelpers$, change, {
        ...state,
        withdrawAmount: state.maxWithdrawAmount,
      })
    }
    if (state.otherAction === 'closeVault') {
      return closeVault(txHelpers$, context, change, state)
    }
  } else {
    return adjustPosition(txHelpers$, context, change, state)
  }
}
