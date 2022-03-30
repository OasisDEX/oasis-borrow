export type VaultErrorMessage =
  | 'depositAmountExceedsCollateralBalance'
  | 'depositingAllEthBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountMoreThanMaxFlashAmount'
  | 'customAllowanceAmountExceedsMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'
  | 'ledgerWalletContractDataDisabled'
  | 'exchangeError'
  | 'withdrawAmountExceedsFreeCollateral'
  | 'withdrawAmountExceedsFreeCollateralAtNextPrice'
  | 'generateAmountExceedsDaiYieldFromTotalCollateral'
  | 'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice'
  | 'paybackAmountExceedsDaiBalance'
  | 'paybackAmountExceedsVaultDebt'
  | 'debtWillBeLessThanDebtFloor'
  | 'customCollateralAllowanceAmountExceedsMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'customDaiAllowanceAmountExceedsMaxUint256'
  | 'customDaiAllowanceAmountLessThanPaybackAmount'
  | 'withdrawCollateralOnVaultUnderDebtFloor'
  | 'shouldShowExchangeError'
  | 'hasToDepositCollateralOnEmptyVault'
  | 'depositCollateralOnVaultUnderDebtFloor'
  | 'invalidSlippage'
  | 'afterCollRatioBelowStopLossRatio'
  | 'vaultWillBeTakenUnderMinActiveColRatio'

interface ErrorMessagesHandler {
  generateAmountLessThanDebtFloor?: boolean
  generateAmountExceedsDebtCeiling?: boolean
  exchangeError?: boolean
  generateAmountMoreThanMaxFlashAmount?: boolean
  ledgerWalletContractDataDisabled?: boolean
  depositingAllEthBalance?: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateral?: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice?: boolean
  customAllowanceAmountExceedsMaxUint256?: boolean
  customAllowanceAmountLessThanDepositAmount?: boolean
  withdrawAmountExceedsFreeCollateral?: boolean
  withdrawAmountExceedsFreeCollateralAtNextPrice?: boolean
  generateAmountExceedsDaiYieldFromTotalCollateral?: boolean
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice?: boolean
  debtWillBeLessThanDebtFloor?: boolean
  customCollateralAllowanceAmountExceedsMaxUint256?: boolean
  customCollateralAllowanceAmountLessThanDepositAmount?: boolean
  customDaiAllowanceAmountExceedsMaxUint256?: boolean
  customDaiAllowanceAmountLessThanPaybackAmount?: boolean
  depositAmountExceedsCollateralBalance?: boolean
  paybackAmountExceedsDaiBalance?: boolean
  paybackAmountExceedsVaultDebt?: boolean
  withdrawCollateralOnVaultUnderDebtFloor?: boolean
  depositCollateralOnVaultUnderDebtFloor?: boolean
  hasToDepositCollateralOnEmptyVault?: boolean
  shouldShowExchangeError?: boolean
  invalidSlippage?: boolean
  afterCollRatioBelowStopLossRatio?: boolean
}

export function errorMessagesHandler({
  generateAmountLessThanDebtFloor,
  generateAmountExceedsDebtCeiling,
  exchangeError,
  generateAmountMoreThanMaxFlashAmount,
  ledgerWalletContractDataDisabled,
  depositingAllEthBalance,
  generateAmountExceedsDaiYieldFromDepositingCollateral,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
  customAllowanceAmountExceedsMaxUint256,
  customAllowanceAmountLessThanDepositAmount,
  withdrawAmountExceedsFreeCollateral,
  withdrawAmountExceedsFreeCollateralAtNextPrice,
  generateAmountExceedsDaiYieldFromTotalCollateral,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
  debtWillBeLessThanDebtFloor,
  customCollateralAllowanceAmountExceedsMaxUint256,
  customCollateralAllowanceAmountLessThanDepositAmount,
  customDaiAllowanceAmountExceedsMaxUint256,
  customDaiAllowanceAmountLessThanPaybackAmount,
  depositAmountExceedsCollateralBalance,
  paybackAmountExceedsDaiBalance,
  paybackAmountExceedsVaultDebt,
  withdrawCollateralOnVaultUnderDebtFloor,
  depositCollateralOnVaultUnderDebtFloor,
  hasToDepositCollateralOnEmptyVault,
  shouldShowExchangeError,
  invalidSlippage,
  afterCollRatioBelowStopLossRatio,
}: ErrorMessagesHandler) {
  const errorMessages: VaultErrorMessage[] = []

  if (depositAmountExceedsCollateralBalance) {
    errorMessages.push('depositAmountExceedsCollateralBalance')
  }

  if (generateAmountLessThanDebtFloor) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (generateAmountExceedsDebtCeiling) {
    errorMessages.push('generateAmountExceedsDebtCeiling')
  }

  if (exchangeError) {
    errorMessages.push('exchangeError')
  }

  if (generateAmountMoreThanMaxFlashAmount) {
    errorMessages.push('generateAmountMoreThanMaxFlashAmount')
  }

  if (ledgerWalletContractDataDisabled) {
    errorMessages.push('ledgerWalletContractDataDisabled')
  }

  if (depositingAllEthBalance) {
    errorMessages.push('depositingAllEthBalance')
  }

  if (generateAmountExceedsDaiYieldFromDepositingCollateral) {
    errorMessages.push('generateAmountExceedsDaiYieldFromDepositingCollateral')
  }

  if (generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice) {
    errorMessages.push('generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice')
  }

  if (customAllowanceAmountExceedsMaxUint256) {
    errorMessages.push('customAllowanceAmountExceedsMaxUint256')
  }

  if (customAllowanceAmountLessThanDepositAmount) {
    errorMessages.push('customAllowanceAmountLessThanDepositAmount')
  }

  if (withdrawAmountExceedsFreeCollateral) {
    errorMessages.push('withdrawAmountExceedsFreeCollateral')
  }

  if (withdrawAmountExceedsFreeCollateralAtNextPrice) {
    errorMessages.push('withdrawAmountExceedsFreeCollateralAtNextPrice')
  }

  if (generateAmountExceedsDaiYieldFromTotalCollateral) {
    errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateral')
  }

  if (generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice) {
    errorMessages.push('generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice')
  }

  if (paybackAmountExceedsVaultDebt) {
    errorMessages.push('paybackAmountExceedsVaultDebt')
  }

  if (debtWillBeLessThanDebtFloor) {
    errorMessages.push('debtWillBeLessThanDebtFloor')
  }

  if (withdrawCollateralOnVaultUnderDebtFloor) {
    errorMessages.push('withdrawCollateralOnVaultUnderDebtFloor')
  }

  if (depositCollateralOnVaultUnderDebtFloor) {
    errorMessages.push('depositCollateralOnVaultUnderDebtFloor')
  }

  if (customCollateralAllowanceAmountExceedsMaxUint256) {
    errorMessages.push('customCollateralAllowanceAmountExceedsMaxUint256')
  }

  if (customCollateralAllowanceAmountLessThanDepositAmount) {
    errorMessages.push('customCollateralAllowanceAmountLessThanDepositAmount')
  }

  if (customDaiAllowanceAmountExceedsMaxUint256) {
    errorMessages.push('customDaiAllowanceAmountExceedsMaxUint256')
  }

  if (customDaiAllowanceAmountLessThanPaybackAmount) {
    errorMessages.push('customDaiAllowanceAmountLessThanPaybackAmount')
  }

  if (paybackAmountExceedsDaiBalance) {
    errorMessages.push('paybackAmountExceedsDaiBalance')
  }

  if (hasToDepositCollateralOnEmptyVault) {
    errorMessages.push('hasToDepositCollateralOnEmptyVault')
  }

  if (shouldShowExchangeError) {
    errorMessages.push('shouldShowExchangeError')
  }

  if (invalidSlippage) {
    errorMessages.push('invalidSlippage')
  }

  if (afterCollRatioBelowStopLossRatio) {
    errorMessages.push('afterCollRatioBelowStopLossRatio')
  }

  return errorMessages
}
