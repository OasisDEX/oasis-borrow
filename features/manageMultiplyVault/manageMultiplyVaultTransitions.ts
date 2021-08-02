import { maxUint256 } from 'blockchain/calls/erc20'
import { TxHelpers } from 'components/AppContext'
import { Observable } from 'rxjs'

import {
  ManageMultiplyVaultEditingStage,
  ManageMultiplyVaultState,
  ManageVaultChange,
} from './manageMultiplyVault'
import { manageVaultFormDefaults } from './manageMultiplyVaultForm'
import { manageVaultDepositAndGenerate } from './manageMultiplyVaultTransactions'

export type ManageVaultTransitionChange =
  | {
      kind: 'toggleEditing'
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

export function applyManageVaultTransition(
  change: ManageVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (change.kind === 'toggleEditing') {
    const { stage } = state
    const currentEditing = stage
    const otherEditing = ([
      'adjustPosition',
      'otherActions',
    ] as ManageMultiplyVaultEditingStage[]).find(
      (editingStage) => editingStage !== currentEditing,
    ) as ManageMultiplyVaultEditingStage
    return {
      ...state,
      ...manageVaultFormDefaults,
      stage: otherEditing,
      originalEditingStage: otherEditing,
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
    // const {
    // errorMessages,
    // proxyAddress,
    // collateralAllowance,
    // daiAllowance,
    // vault: { token, debtOffset },
    // } = state
    // const canProgress = !errorMessages.length
    // const hasProxy = !!proxyAddress
    // const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    // const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    // const depositAmountLessThanCollateralAllowance =
    //   collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)
    // const paybackAmountLessThanDaiAllowance =
    //   daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))
    // const hasCollateralAllowance =
    //   token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero
    // const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero
    // if (canProgress) {
    //   if (!hasProxy) {
    //     return { ...state, stage: 'proxyWaitingForConfirmation' }
    //   }
    //   if (!hasCollateralAllowance) {
    //     return { ...state, stage: 'collateralAllowanceWaitingForConfirmation' }
    //   }
    //   if (!hasDaiAllowance) {
    //     return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    //   }
    //   return { ...state, stage: 'manageWaitingForConfirmation' }
    // }
  }

  if (change.kind === 'progressProxy') {
    // const {
    // originalEditingStage,
    // collateralAllowance,
    // daiAllowance,
    // vault: { token, debtOffset },
    // } = state
    //   const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
    //   const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    //   const depositAmountLessThanCollateralAllowance =
    //     collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)
    //   const paybackAmountLessThanDaiAllowance =
    //     daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))
    //   const hasCollateralAllowance =
    //     token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero
    //   const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero
    //   if (!hasCollateralAllowance) {
    //     return { ...state, stage: 'collateralAllowanceWaitingForConfirmation' }
    //   }
    //   if (!hasDaiAllowance) {
    //     return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    //   }
    //   return { ...state, stage: originalEditingStage }
    // }
    // if (change.kind === 'progressCollateralAllowance') {
    //   const {
    //     originalEditingStage,
    //     paybackAmount,
    //     daiAllowance,
    //     vault: { debtOffset },
    //   } = state
    //   const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
    //   const paybackAmountLessThanDaiAllowance =
    //     daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))
    //   const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero
    //   if (!hasDaiAllowance) {
    //     return { ...state, stage: 'daiAllowanceWaitingForConfirmation' }
    //   }
    //   return { ...state, stage: originalEditingStage }
  }

  return state
}

export function progressManage(
  txHelpers$: Observable<TxHelpers>,
  state: ManageMultiplyVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  // const { depositAmount, generateAmount } = state
  // const isDepositAndGenerate = depositAmount || generateAmount

  return manageVaultDepositAndGenerate(txHelpers$, change, state)
  // if (true) {
  //   return manageVaultDepositAndGenerate(txHelpers$, change, state)
  // } else {
  //   return manageVaultWithdrawAndPayback(txHelpers$, change, state)
  // }
}
