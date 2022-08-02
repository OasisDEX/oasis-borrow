import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'

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
  'afterCollRatioBelowBasicSellRatio',
  'afterCollRatioAboveBasicBuyRatio',
  'vaultWillBeTakenUnderMinActiveColRatio',
  'stopLossOnNearLiquidationRatio',

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
]

export function extractCommonWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => commonWarnings.includes(message))
}

const cancelAutoBuyWarnings = ['potentialInsufficientEthFundsForTx']

export function extractCancelBSWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => cancelAutoBuyWarnings.includes(message))
}

const cancelAutoBuyErrors = ['insufficientEthFundsForTx']

export function extractCancelBSErrors(errorMessages: VaultErrorMessage[]) {
  return errorMessages.filter((message) => cancelAutoBuyErrors.includes(message))
}

const constantMultipleSliderWarnings = [
  'constantMultipleSellTriggerCloseToStopLossTrigger',
  'stopLossTriggerCloseToConstantMultipleSellTrigger',
  'constantMultipleAutoSellTriggeredImmediately',
  'constantMultipleAutoBuyTriggeredImmediately',
]

export function extractConstantMultipleSliderWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => constantMultipleSliderWarnings.includes(message))
}

const constantMultipleCommonWarnings = [
  'potentialInsufficientEthFundsForTx',
  'addingConstantMultipleWhenAutoSellOrBuyEnabled',
]

export function extractConstantMultipleCommonWarnings(warningMessages: VaultWarningMessage[]) {
  return warningMessages.filter((message) => constantMultipleCommonWarnings.includes(message))
}
