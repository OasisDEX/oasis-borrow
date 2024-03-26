import { zero } from 'helpers/zero'

import { MAX_COLL_RATIO } from './manageMultiplyVaultCalculations.constants'
import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import { manageMultiplyInputsDefaults } from './manageMultiplyVaultForm.constants'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export function applyManageVaultForm(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (change.kind === 'toggleSliderController') {
    const isDepositAction =
      state.otherAction === 'depositCollateral' || state.otherAction === 'depositDai'
    const isWithdrawAction =
      state.otherAction === 'withdrawCollateral' || state.otherAction === 'withdrawDai'

    const requiredCollRatioAtDeposit =
      state.depositAmount?.gt(zero) || state.depositDaiAmount?.gt(zero)
        ? state.maxCollRatio
        : MAX_COLL_RATIO

    const requiredCollRatioAtWithdraw =
      state.withdrawAmount?.gt(zero) || state.generateAmount?.gt(zero)
        ? state.vault.collateralizationRatio
        : MAX_COLL_RATIO

    const requiredCollRatio = isDepositAction
      ? requiredCollRatioAtDeposit
      : isWithdrawAction
        ? requiredCollRatioAtWithdraw
        : undefined

    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      showSliderController: !state.showSliderController,
      depositAmount: state.depositAmount,
      depositAmountUSD: state.depositAmountUSD,
      withdrawAmount: state.withdrawAmount,
      withdrawAmountUSD: state.withdrawAmountUSD,
      depositDaiAmount: state.depositDaiAmount,
      generateAmount: state.generateAmount,
      requiredCollRatio: !state.showSliderController ? requiredCollRatio : undefined,
    }
  }

  if (change.kind === 'mainAction') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      mainAction: change.mainAction,
    }
  }

  if (change.kind === 'otherAction') {
    return {
      ...state,
      ...manageMultiplyInputsDefaults,
      otherAction: change.otherAction,
    }
  }

  if (change.kind === 'closeVaultTo') {
    return {
      ...state,
      closeVaultTo: change.closeVaultTo,
    }
  }

  return state
}
