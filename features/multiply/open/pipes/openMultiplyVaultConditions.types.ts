export interface OpenMultiplyVaultConditions {
  isEditingStage: boolean
  isStopLossEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
  isAddStopLossStage: boolean
  withProxyStep: boolean
  withAllowanceStep: boolean

  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateral: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: boolean
  generateAmountExceedsDebtCeiling: boolean
  generateAmountLessThanDebtFloor: boolean
  generateAmountMoreThanMaxFlashAmount: boolean
  ledgerWalletContractDataDisabled: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  isSuccessStage: boolean
  canProgress: boolean
  canRegress: boolean
  canAdjustRisk: boolean
  isExchangeLoading: boolean

  highSlippage: boolean

  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
  openFlowWithStopLoss: boolean
  isStopLossSuccessStage: boolean
}
