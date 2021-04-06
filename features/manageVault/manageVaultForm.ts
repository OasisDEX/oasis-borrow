import { ManageVaultChange, ManageVaultState } from './manageVault'
import { allowanceDefaults } from './manageVaultAllowances'
import { depositAndGenerateDefaults, paybackAndWithdrawDefaults } from './manageVaultInput'

export const manageVaultFormDefaults: Partial<ManageVaultState> = {
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
      kind: 'toggleIlkDetails'
    }
  | {
      kind: 'resetDefaults'
    }

export function applyManageVaultForm(
  { kind }: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
  const {
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    stage,
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
  } = state
  const isCollateralStage = stage === 'collateralEditing'
  const isDaiStage = stage === 'daiEditing'

  const onToggleCloseShouldClearGenerateAmount = showDepositAndGenerateOption && isCollateralStage
  const onToggleCloseShouldClearDepositAmount = showDepositAndGenerateOption && isDaiStage
  const onToggleCloseShouldClearPaybackAmount = showPaybackAndWithdrawOption && isCollateralStage
  const onToggleCloseShouldClearWithdrawAmount = showPaybackAndWithdrawOption && isDaiStage

  const canToggleDepositAndGenerate =
    (isCollateralStage && depositAmount) || (isDaiStage && generateAmount)
  const canTogglePaybackAndWithdraw =
    (isCollateralStage && withdrawAmount) || (isDaiStage && paybackAmount)

  if (kind === 'toggleDepositAndGenerateOption' && canToggleDepositAndGenerate) {
    return {
      ...state,
      showDepositAndGenerateOption: !showDepositAndGenerateOption,
      ...(onToggleCloseShouldClearGenerateAmount && { generateAmount: undefined }),
      ...(onToggleCloseShouldClearDepositAmount && { depositAmount: undefined }),
    }
  }

  if (kind === 'togglePaybackAndWithdrawOption' && canTogglePaybackAndWithdraw) {
    return {
      ...state,
      showPaybackAndWithdrawOption: !showPaybackAndWithdrawOption,
      ...(onToggleCloseShouldClearPaybackAmount && { paybackAmount: undefined }),
      ...(onToggleCloseShouldClearWithdrawAmount && { withdrawAmount: undefined }),
    }
  }

  if (kind === 'toggleIlkDetails') {
    return {
      ...state,
      showIlkDetails: !state.showIlkDetails,
    }
  }

  return state
}
