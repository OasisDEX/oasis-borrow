export interface ManageVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isManageStage: boolean
  isBorrowTransitionStage: boolean

  canProgress: boolean
  canRegress: boolean

  depositAndWithdrawAmountsEmpty: boolean
  generateAndPaybackAmountsEmpty: boolean
  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean
  debtIsLessThanDebtFloor: boolean

  accountIsConnected: boolean
  accountIsController: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  depositDaiAmountExceedsDaiBalance: boolean
  withdrawAmountExceedsFreeCollateral: boolean
  withdrawAmountExceedsFreeCollateralAtNextPrice: boolean
  generateAmountExceedsDaiYieldFromTotalCollateral: boolean
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: boolean
  generateAmountLessThanDebtFloor: boolean
  generateAmountExceedsDebtCeiling: boolean
  paybackAmountExceedsVaultDebt: boolean
  paybackAmountExceedsDaiBalance: boolean
  generateAmountMoreThanMaxFlashAmount: boolean
  debtWillBeLessThanDebtFloor: boolean
  isLoadingStage: boolean
  isSuccessStage: boolean
  exchangeDataRequired: boolean
  shouldShowExchangeError: boolean
  isExchangeLoading: boolean

  insufficientCollateralAllowance: boolean
  customCollateralAllowanceAmountEmpty: boolean
  customCollateralAllowanceAmountExceedsMaxUint256: boolean
  customCollateralAllowanceAmountLessThanDepositAmount: boolean
  ledgerWalletContractDataDisabled: boolean

  insufficientDaiAllowance: boolean
  customDaiAllowanceAmountEmpty: boolean
  customDaiAllowanceAmountExceedsMaxUint256: boolean
  customDaiAllowanceAmountLessThanPaybackAmount: boolean
  withdrawCollateralOnVaultUnderDebtFloor: boolean

  hasToDepositCollateralOnEmptyVault: boolean

  highSlippage: boolean
  invalidSlippage: boolean
  stopLossTriggered: boolean
  autoTakeProfitTriggered: boolean
  afterCollRatioBelowStopLossRatio: boolean
  afterCollRatioBelowAutoSellRatio: boolean
  afterCollRatioAboveAutoBuyRatio: boolean
  takeProfitWillTriggerImmediatelyAfterVaultReopen: boolean
  existingTakeProfitTriggerAfterVaultReopen: boolean

  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
}
