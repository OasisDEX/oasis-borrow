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

export const manageMultiplyInputsDefaults: Partial<ManageMultiplyVaultState> = {
  buyAmount: undefined,
  buyAmountUSD: undefined,
  sellAmount: undefined,
  sellAmountUSD: undefined,
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
  ...manageMultiplyInputsDefaults,
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
      ...manageMultiplyInputsDefaults,
      showSliderController: !state.showSliderController,
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
