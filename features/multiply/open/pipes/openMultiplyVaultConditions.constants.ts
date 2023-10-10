import type { OpenMultiplyVaultConditions } from './openMultiplyVaultConditions.types'

export const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isStopLossEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}
export const defaultOpenMultiplyVaultConditions: OpenMultiplyVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,
  canAdjustRisk: false,

  vaultWillBeAtRiskLevelWarning: false,
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeUnderCollateralized: false,

  vaultWillBeAtRiskLevelWarningAtNextPrice: false,
  vaultWillBeAtRiskLevelDangerAtNextPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,
  potentialGenerateAmountLessThanDebtFloor: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  generateAmountExceedsDaiYieldFromDepositingCollateral: false,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountLessThanDebtFloor: false,
  generateAmountMoreThanMaxFlashAmount: false,
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  isSuccessStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,
  withProxyStep: false,
  withAllowanceStep: false,

  highSlippage: false,
  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
  openFlowWithStopLoss: false,
  isStopLossSuccessStage: false,
  isAddStopLossStage: false,
}
