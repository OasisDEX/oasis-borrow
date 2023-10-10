import type { OpenVaultConditions } from './openVaultConditions.types'

export const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isStopLossEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
  isAddStopLossStage: false,
}

export const defaultOpenVaultConditions: OpenVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,

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
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  isSuccessStage: false,
  isStopLossSuccessStage: false,
  openFlowWithStopLoss: false,
  canProgress: false,
  canRegress: false,
  withProxyStep: false,
  withAllowanceStep: false,

  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
  stopLossOnNearLiquidationRatio: false,
  stopLossHigherThanCurrentOrNext: false,
  currentCollRatioCloseToStopLoss: false,
}
