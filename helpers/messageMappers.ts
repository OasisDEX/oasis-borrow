import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'

const depositErrors = [
  'depositAmountExceedsCollateralBalance',
  'depositDaiAmountExceedsDaiBalance',
  'depositingAllEthBalance',
  'depositCollateralOnVaultUnderDebtFloor',
]

export function extractDepositErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => depositErrors.includes(message))
}

const generateErrors = [
  'generateAmountExceedsDaiYieldFromDepositingCollateral',
  'generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice',
  'generateAmountExceedsDebtCeiling',
  'generateAmountMoreThanMaxFlashAmount',
  'generateAmountLessThanDebtFloor',
  'generateAmountExceedsDaiYieldFromTotalCollateral',
  'generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice',
]

export function extractGenerateErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => generateErrors.includes(message))
}

const withdrawErrors = [
  'withdrawAmountExceedsFreeCollateral',
  'withdrawAmountExceedsFreeCollateralAtNextPrice',
  'withdrawCollateralOnVaultUnderDebtFloor',
]

export function extractWithdrawErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => withdrawErrors.includes(message))
}

const paybackErrors = ['paybackAmountExceedsDaiBalance', 'paybackAmountExceedsVaultDebt']

export function extractPaybackErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => paybackErrors.includes(message))
}

const commonErrors = [
  'ledgerWalletContractDataDisabled',
  'insufficientEthFundsForTx',
  'exchangeError',
  'debtWillBeLessThanDebtFloor',
  'shouldShowExchangeError',
  'hasToDepositCollateralOnEmptyVault',
  'invalidSlippage',
  'afterCollRatioBelowStopLossRatio',
  'afterCollRatioBelowAutoSellRatio',
  'afterCollRatioAboveAutoBuyRatio',
  'afterCollRatioBelowConstantMultipleSellRatio',
  'afterCollRatioAboveConstantMultipleBuyRatio',
  'vaultWillBeTakenUnderMinActiveColRatio',
  'stopLossOnNearLiquidationRatio',
  'takeProfitWillTriggerImmediatelyAfterVaultReopen',

  'customDaiAllowanceAmountLessThanPaybackAmount',
  'customAllowanceAmountExceedsMaxUint256',
  'customCollateralAllowanceAmountExceedsMaxUint256',
  'customDaiAllowanceAmountExceedsMaxUint256',
  'customAllowanceAmountLessThanDepositAmount',
  'customCollateralAllowanceAmountLessThanDepositAmount',
]

export function extractCommonErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => commonErrors.includes(message))
}

const generateWarnings = ['potentialGenerateAmountLessThanDebtFloor']

export function extractGenerateWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => generateWarnings.includes(message))
}

const commonWarnings = [
  'debtIsLessThanDebtFloor',
  'vaultWillBeAtRiskLevelDanger',
  'vaultWillBeAtRiskLevelWarning',
  'vaultWillBeAtRiskLevelDangerAtNextPrice',
  'vaultWillBeAtRiskLevelWarningAtNextPrice',
  'highSlippage',
  'customSlippageOverridden',
  'vaultIsCurrentlyUnderMinActiveColRatio',
  'vaultWillRemainUnderMinActiveColRatio',
  'potentialInsufficientEthFundsForTx',
  'nextCollRatioCloseToCurrentSl',
  'existingTakeProfitTriggerAfterVaultReopen',
]

export function extractCommonWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => commonWarnings.includes(message))
}

const cancelAutoBuyWarnings = ['potentialInsufficientEthFundsForTx']

export function extractCancelAutomationWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => cancelAutoBuyWarnings.includes(message))
}

const cancelAutoBuyErrors = ['insufficientEthFundsForTx']

export function extractCancelAutomationErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => cancelAutoBuyErrors.includes(message))
}

const constantMultipleSliderWarnings = [
  'constantMultipleSellTriggerCloseToStopLossTrigger',
  'constantMultipleAutoSellTriggeredImmediately',
  'constantMultipleAutoBuyTriggeredImmediately',
  'constantMultipleBuyTriggerGreaterThanAutoTakeProfit',
]

export function extractConstantMultipleSliderWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => constantMultipleSliderWarnings.includes(message))
}

const constantMultipleCommonWarnings = [
  'potentialInsufficientEthFundsForTx',
  'addingConstantMultipleWhenAutoSellOrBuyEnabled',
  'noMinSellPriceWhenStopLossEnabled',
]

export function extractConstantMultipleCommonWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => constantMultipleCommonWarnings.includes(message))
}

const constantMultipleCommonErrors = ['insufficientEthFundsForTx']

export function extractConstantMultipleCommonErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => constantMultipleCommonErrors.includes(message))
}

const constantMultipleMaxBuyInputErrors = [
  'maxBuyPriceWillPreventBuyTrigger',
  'autoBuyMaxBuyPriceNotSpecified',
]

export function extractConstantMultipleMaxBuyErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => constantMultipleMaxBuyInputErrors.includes(message))
}

const constantMultipleMinSellInputErrors = [
  'minSellPriceWillPreventSellTrigger',
  'minimumSellPriceNotProvided',
]

export function extractConstantMultipleMinSellErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => constantMultipleMinSellInputErrors.includes(message))
}
