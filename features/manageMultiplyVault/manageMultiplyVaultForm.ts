import {
  CloseVaultTo,
  MainAction,
  ManageMultiplyVaultChange,
  ManageMultiplyVaultState,
  OtherAction,
} from './manageMultiplyVault'
import { allowanceDefaults } from './manageMultiplyVaultAllowances'

export type ManageVaultFormChange =
  | {
      kind: 'toggleDepositAndGenerateOption'
    }
  | {
      kind: 'togglePaybackAndWithdrawOption'
    }
  | {
      kind: 'resetDefaults'
    }
  | {
      kind: 'toggleSliderController'
    }
  | {
      kind: 'mainAction'
      mainAction: MainAction
    }
  | {
      kind: 'otherAction'
      otherAction: OtherAction
    }
  | {
      kind: 'closeVaultTo'
      closeVaultTo: CloseVaultTo
    }

export const otherActionsDefaults: Partial<ManageMultiplyVaultState> = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  paybackAmount: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  generateAmount: undefined,

  requiredCollRatio: undefined,
}

export const manageVaultFormDefaults: Partial<ManageMultiplyVaultState> = {
  ...allowanceDefaults,
  ...otherActionsDefaults,
}

export function applyManageVaultForm(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  // const {
  // showDepositAndGenerateOption,
  // showPaybackAndWithdrawOption,
  // stage,
  // depositAmount,
  // generateAmount,
  // withdrawAmount,
  // paybackAmount,
  // } = state
  // const isCollateralStage = stage === 'adjustPosition'
  // const isDaiStage = stage === 'otherActions'

  // TODO adjust this to manage multiply vault
  // const shouldClearGenerateAmount = showDepositAndGenerateOption && isCollateralStage
  // const shouldClearDepositAmount = showDepositAndGenerateOption && isDaiStage
  // const shouldClearPaybackAmount = showPaybackAndWithdrawOption && isCollateralStage
  // const shouldClearWithdrawAmount = showPaybackAndWithdrawOption && isDaiStage

  // const canToggleDepositAndGenerate =
  //   (isCollateralStage && depositAmount) || (isDaiStage && generateAmount)
  // const canTogglePaybackAndWithdraw =
  //   (isCollateralStage && withdrawAmount) || (isDaiStage && paybackAmount)

  // if (kind === 'toggleDepositAndGenerateOption' && canToggleDepositAndGenerate) {
  //   return {
  //     ...state,
  //     showDepositAndGenerateOption: !showDepositAndGenerateOption,
  //     ...(shouldClearGenerateAmount && { generateAmount: undefined }),
  //     ...(shouldClearDepositAmount && { depositAmount: undefined }),
  //   }
  // }

  // if (kind === 'togglePaybackAndWithdrawOption' && canTogglePaybackAndWithdraw) {
  //   return {
  //     ...state,
  //     showPaybackAndWithdrawOption: !showPaybackAndWithdrawOption,
  //     ...(shouldClearPaybackAmount && { paybackAmount: undefined }),
  //     ...(shouldClearWithdrawAmount && { withdrawAmount: undefined }),
  //   }
  // }

  if (change.kind === 'toggleSliderController') {
    return {
      ...state,
      showSliderController: !state.showSliderController,
    }
  }

  if (change.kind === 'mainAction') {
    return {
      ...state,
      ...otherActionsDefaults,
      mainAction: change.mainAction,
    }
  }

  if (change.kind === 'otherAction') {
    return {
      ...state,
      ...otherActionsDefaults,
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
