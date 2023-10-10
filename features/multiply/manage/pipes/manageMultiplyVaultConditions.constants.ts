import type { ManageVaultConditions } from './manageMultiplyVaultConditions.types'

export const defaultManageVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
  isBorrowTransitionStage: false,
}
export const defaultManageMultiplyVaultConditions: ManageVaultConditions = {
  ...defaultManageVaultStageCategories,
  canProgress: false,
  canRegress: false,

  vaultWillBeAtRiskLevelWarning: false,
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeUnderCollateralized: false,

  vaultWillBeAtRiskLevelWarningAtNextPrice: false,
  vaultWillBeAtRiskLevelDangerAtNextPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,
  potentialGenerateAmountLessThanDebtFloor: false,
  debtIsLessThanDebtFloor: false,

  depositAndWithdrawAmountsEmpty: true,
  generateAndPaybackAmountsEmpty: true,
  inputAmountsEmpty: true,

  accountIsConnected: false,
  accountIsController: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  depositDaiAmountExceedsDaiBalance: false,
  withdrawAmountExceedsFreeCollateral: false,
  withdrawAmountExceedsFreeCollateralAtNextPrice: false,
  generateAmountExceedsDaiYieldFromTotalCollateral: false,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: false,
  generateAmountLessThanDebtFloor: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountMoreThanMaxFlashAmount: false,
  paybackAmountExceedsVaultDebt: false,
  paybackAmountExceedsDaiBalance: false,

  debtWillBeLessThanDebtFloor: false,
  isLoadingStage: false,
  isSuccessStage: false,
  exchangeDataRequired: false,
  shouldShowExchangeError: false,
  isExchangeLoading: false,

  insufficientCollateralAllowance: false,
  customCollateralAllowanceAmountEmpty: false,
  customCollateralAllowanceAmountExceedsMaxUint256: false,
  customCollateralAllowanceAmountLessThanDepositAmount: false,
  ledgerWalletContractDataDisabled: false,

  insufficientDaiAllowance: false,
  customDaiAllowanceAmountEmpty: false,
  customDaiAllowanceAmountExceedsMaxUint256: false,
  customDaiAllowanceAmountLessThanPaybackAmount: false,

  withdrawCollateralOnVaultUnderDebtFloor: false,

  hasToDepositCollateralOnEmptyVault: false,

  highSlippage: false,
  invalidSlippage: false,
  stopLossTriggered: false,
  autoTakeProfitTriggered: false,
  afterCollRatioBelowStopLossRatio: false,
  afterCollRatioBelowAutoSellRatio: false,
  afterCollRatioAboveAutoBuyRatio: false,
  afterCollRatioBelowConstantMultipleSellRatio: false,
  afterCollRatioAboveConstantMultipleBuyRatio: false,
  takeProfitWillTriggerImmediatelyAfterVaultReopen: false,
  existingTakeProfitTriggerAfterVaultReopen: false,

  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
}
