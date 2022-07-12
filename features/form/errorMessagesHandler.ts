export type VaultErrorMessage =
  | 'depositAmountExceedsCollateralBalance'
  | 'depositDaiAmountExceedsDaiBalance'
  | 'depositingAllEthBalance'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateral'
  | 'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice'
  | 'generateAmountExceedsDebtCeiling'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountMoreThanMaxFlashAmount'
  | 'customAllowanceAmountExceedsMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'
  | 'ledgerWalletContractDataDisabled'
  | 'insufficientEthFundsForTx'
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
  | 'afterCollRatioBelowBasicSellRatio'
  | 'afterCollRatioAboveBasicBuyRatio'
  | 'vaultWillBeTakenUnderMinActiveColRatio'
  | 'stopLossOnNearLiquidationRatio'
  | 'stopLossHigherThanCurrentOrNext'
  | 'maxDebtForSettingStopLoss'
  | 'targetCollRatioExceededDustLimitCollRatio'
  | 'autoBuyMaxBuyPriceNotSpecified'
  | 'minimumSellPriceNotProvided'
  | 'autoSellTriggerHigherThanAutoBuyTarget'
  | 'autoBuyTriggerLowerThanAutoSellTarget'
  | 'stopLossTriggerHigherThanAutoBuyTarget'

interface ErrorMessagesHandler {
  generateAmountLessThanDebtFloor?: boolean
  generateAmountExceedsDebtCeiling?: boolean
  exchangeError?: boolean
  generateAmountMoreThanMaxFlashAmount?: boolean
  ledgerWalletContractDataDisabled?: boolean
  insufficientEthFundsForTx?: boolean
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
  depositDaiAmountExceedsDaiBalance?: boolean
  paybackAmountExceedsDaiBalance?: boolean
  paybackAmountExceedsVaultDebt?: boolean
  withdrawCollateralOnVaultUnderDebtFloor?: boolean
  depositCollateralOnVaultUnderDebtFloor?: boolean
  hasToDepositCollateralOnEmptyVault?: boolean
  shouldShowExchangeError?: boolean
  invalidSlippage?: boolean
  afterCollRatioBelowStopLossRatio?: boolean
  afterCollRatioBelowBasicSellRatio?: boolean
  afterCollRatioAboveBasicBuyRatio?: boolean
  stopLossOnNearLiquidationRatio?: boolean
  stopLossHigherThanCurrentOrNext?: boolean
  maxDebtForSettingStopLoss?: boolean
  targetCollRatioExceededDustLimitCollRatio?: boolean
  autoBuyMaxBuyPriceNotSpecified?: boolean
  minimumSellPriceNotProvided?: boolean
  autoSellTriggerHigherThanAutoBuyTarget?: boolean
  autoBuyTriggerLowerThanAutoSellTarget?: boolean
  stopLossTriggerHigherThanAutoBuyTarget?: boolean
}

export function errorMessagesHandler({
  generateAmountLessThanDebtFloor,
  generateAmountExceedsDebtCeiling,
  exchangeError,
  generateAmountMoreThanMaxFlashAmount,
  ledgerWalletContractDataDisabled,
  insufficientEthFundsForTx,
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
  depositDaiAmountExceedsDaiBalance,
  paybackAmountExceedsDaiBalance,
  paybackAmountExceedsVaultDebt,
  withdrawCollateralOnVaultUnderDebtFloor,
  depositCollateralOnVaultUnderDebtFloor,
  hasToDepositCollateralOnEmptyVault,
  shouldShowExchangeError,
  invalidSlippage,
  afterCollRatioBelowStopLossRatio,
  afterCollRatioBelowBasicSellRatio,
  afterCollRatioAboveBasicBuyRatio,
  stopLossOnNearLiquidationRatio,
  stopLossHigherThanCurrentOrNext,
  maxDebtForSettingStopLoss,
  targetCollRatioExceededDustLimitCollRatio,
  autoBuyMaxBuyPriceNotSpecified,
  minimumSellPriceNotProvided,
  autoSellTriggerHigherThanAutoBuyTarget,
  autoBuyTriggerLowerThanAutoSellTarget,
  stopLossTriggerHigherThanAutoBuyTarget,
}: ErrorMessagesHandler) {
  const errorMessages: VaultErrorMessage[] = []

  if (depositAmountExceedsCollateralBalance) {
    errorMessages.push('depositAmountExceedsCollateralBalance')
  }

  if (depositDaiAmountExceedsDaiBalance) {
    errorMessages.push('depositDaiAmountExceedsDaiBalance')
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

  if (afterCollRatioBelowBasicSellRatio) {
    errorMessages.push('afterCollRatioBelowBasicSellRatio')
  }

  if (afterCollRatioAboveBasicBuyRatio) {
    errorMessages.push('afterCollRatioAboveBasicBuyRatio')
  }

  if (insufficientEthFundsForTx) {
    errorMessages.push('insufficientEthFundsForTx')
  }

  if (stopLossOnNearLiquidationRatio) {
    errorMessages.push('stopLossOnNearLiquidationRatio')
  }

  if (stopLossHigherThanCurrentOrNext) {
    errorMessages.push('stopLossHigherThanCurrentOrNext')
  }

  if (maxDebtForSettingStopLoss) {
    errorMessages.push('maxDebtForSettingStopLoss')
  }

  if (targetCollRatioExceededDustLimitCollRatio) {
    errorMessages.push('targetCollRatioExceededDustLimitCollRatio')
  }
  if (minimumSellPriceNotProvided) {
    errorMessages.push('minimumSellPriceNotProvided')
  }

  if (autoBuyMaxBuyPriceNotSpecified) {
    errorMessages.push('autoBuyMaxBuyPriceNotSpecified')
  }

  if (autoSellTriggerHigherThanAutoBuyTarget) {
    errorMessages.push('autoSellTriggerHigherThanAutoBuyTarget')
  }

  if (autoBuyTriggerLowerThanAutoSellTarget) {
    errorMessages.push('autoBuyTriggerLowerThanAutoSellTarget')
  }

  if (stopLossTriggerHigherThanAutoBuyTarget) {
    errorMessages.push('stopLossTriggerHigherThanAutoBuyTarget')
  }

  return errorMessages
}
