import { SLIPPAGE_DEFAULT } from 'features/userSettings/userSettings.constants'

import type { GuniOpenMultiplyVaultConditions } from './openGuniVaultConditions.types'

export const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}
export const defaultGuniOpenMultiplyVaultConditions: GuniOpenMultiplyVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,

  generateAmountLessThanDebtFloor: false,
  generateAmountMoreThanMaxFlashAmount: false,
  generateAmountExceedsDebtCeiling: false,
  depositAmountExceedsCollateralBalance: false,
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,
  potentialGenerateAmountLessThanDebtFloor: false,

  isLoadingStage: false,
  isSuccessStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,

  highSlippage: false,
  customSlippageOverridden: false,
  customSlippage: SLIPPAGE_DEFAULT,

  insufficientEthFundsForTx: false,
}
