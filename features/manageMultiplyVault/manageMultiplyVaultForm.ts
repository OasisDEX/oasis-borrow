import { MainAction, ManageMultiplyVaultState, ManageVaultChange } from './manageMultiplyVault'
import { allowanceDefaults } from './manageMultiplyVaultAllowances'
import { depositAndGenerateDefaults, paybackAndWithdrawDefaults } from './manageMultiplyVaultInput'

export const manageVaultFormDefaults: Partial<ManageMultiplyVaultState> = {
  ...allowanceDefaults,
  ...depositAndGenerateDefaults,
  ...paybackAndWithdrawDefaults,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
}

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

export function applyManageVaultForm(
  change: ManageVaultChange,
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
      mainAction: change.mainAction,
    }
  }

  return state
}
