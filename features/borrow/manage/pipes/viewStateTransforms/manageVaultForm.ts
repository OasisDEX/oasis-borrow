import {
  CloseVaultTo,
  MainAction,
  ManageBorrowVaultState,
  ManageVaultChange,
  OtherAction,
} from 'features/borrow/manage/pipes/manageVault'

import { allowanceDefaults } from './manageVaultAllowances'
import { depositAndGenerateDefaults, paybackAndWithdrawDefaults } from './manageVaultInput'

export const manageVaultFormDefaults: Partial<ManageBorrowVaultState> = {
  ...allowanceDefaults,
  ...depositAndGenerateDefaults,
  ...paybackAndWithdrawDefaults,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
  requiredCollRatio: undefined,
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

export function applyManageVaultForm<VaultState extends ManageBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  const {
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    stage,
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    mainAction,
  } = state
  const isCollateralStage = stage === 'collateralEditing'
  const isDaiStage = stage === 'daiEditing'

  const shouldClearGenerateAmount = showDepositAndGenerateOption && isCollateralStage
  const shouldClearDepositAmount = showDepositAndGenerateOption && isDaiStage
  const shouldClearPaybackAmount = showPaybackAndWithdrawOption && isCollateralStage
  const shouldClearWithdrawAmount = showPaybackAndWithdrawOption && isDaiStage

  const canToggleDepositAndGenerate =
    (isCollateralStage && depositAmount) || (isDaiStage && generateAmount)
  const canTogglePaybackAndWithdraw =
    (isCollateralStage && withdrawAmount) || (isDaiStage && paybackAmount)

  if (change.kind === 'toggleDepositAndGenerateOption' && canToggleDepositAndGenerate) {
    return {
      ...state,
      showDepositAndGenerateOption: !showDepositAndGenerateOption,
      ...(shouldClearGenerateAmount && { generateAmount: undefined }),
      ...(shouldClearDepositAmount && { depositAmount: undefined }),
    }
  }

  if (change.kind === 'togglePaybackAndWithdrawOption' && canTogglePaybackAndWithdraw) {
    return {
      ...state,
      showPaybackAndWithdrawOption: !showPaybackAndWithdrawOption,
      ...(shouldClearPaybackAmount && { paybackAmount: undefined }),
      ...(shouldClearWithdrawAmount && { withdrawAmount: undefined }),
    }
  }

  if (change.kind === 'mainAction') {
    return {
      ...state,
      mainAction: change.mainAction,
      ...(mainAction === 'depositGenerate' && {
        depositAmount: undefined,
        depositAmountUSD: undefined,
        generateAmount: undefined,
        showDepositAndGenerateOption: false,
      }),
      ...(mainAction === 'withdrawPayback' && {
        withdrawAmount: undefined,
        withdrawAmountUSD: undefined,
        paybackAmount: undefined,
        showPaybackAndWithdrawOption: false,
      }),
    }
  }

  return state
}
