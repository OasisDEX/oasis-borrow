export type VaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'vaultWillBeAtRiskLevelDanger'
  | 'vaultWillBeAtRiskLevelWarning'
  | 'vaultWillBeAtRiskLevelDangerAtNextPrice'
  | 'vaultWillBeAtRiskLevelWarningAtNextPrice'
  | 'debtIsLessThanDebtFloor'
  | 'potentialInsufficientEthFundsForTx'
  | 'highSlippage'
  | 'customSlippageOverridden'
  | 'vaultIsCurrentlyUnderMinActiveColRatio'
  | 'vaultWillRemainUnderMinActiveColRatio'
  | 'currentCollRatioCloseToStopLoss'
  | 'noMinSellPriceWhenStopLossEnabled'
  | 'settingAutoBuyTriggerWithNoThreshold'
  | 'settingAutoSellTriggerWithNoThreshold'
  | 'autoSellTriggerCloseToStopLossTrigger'
  | 'autoSellTargetCloseToAutoBuyTrigger'
  | 'stopLossTriggerCloseToAutoSellTrigger'
  | 'autoBuyTargetCloseToStopLossTrigger'
  | 'autoBuyTargetCloseToAutoSellTrigger'
  | 'autoBuyTriggeredImmediately'
  | 'autoSellTriggeredImmediately'
  | 'constantMultipleSellTriggerCloseToStopLossTrigger'
  | 'stopLossTriggerCloseToConstantMultipleSellTrigger'
  | 'addingConstantMultipleWhenAutoSellOrBuyEnabled'
  | 'constantMultipleAutoSellTriggeredImmediately'
  | 'constantMultipleAutoBuyTriggeredImmediately'
  | 'autoTakeProfitTriggerLowerThanAutoBuyTrigger'
  | 'autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger'
  | 'autoBuyTriggerGreaterThanAutoTakeProfit'
  | 'constantMultipleBuyTriggerGreaterThanAutoTakeProfit'
  | 'existingTakeProfitTriggerAfterVaultReopen'
  | 'stopLossTriggeredImmediately'

interface WarningMessagesHandler {
  potentialGenerateAmountLessThanDebtFloor?: boolean
  vaultWillBeAtRiskLevelDanger?: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice?: boolean
  vaultWillBeAtRiskLevelWarning?: boolean
  vaultWillBeAtRiskLevelWarningAtNextPrice?: boolean
  debtIsLessThanDebtFloor?: boolean
  potentialInsufficientEthFundsForTx?: boolean
  highSlippage?: boolean
  customSlippageOverridden?: boolean
  currentCollRatioCloseToStopLoss?: boolean
  noMinSellPriceWhenStopLossEnabled?: boolean
  settingAutoBuyTriggerWithNoThreshold?: boolean
  autoSellTriggerCloseToStopLossTrigger?: boolean
  autoSellTargetCloseToAutoBuyTrigger?: boolean
  stopLossTriggerCloseToAutoSellTrigger?: boolean
  autoBuyTargetCloseToStopLossTrigger?: boolean
  autoBuyTargetCloseToAutoSellTrigger?: boolean
  autoSellTriggeredImmediately?: boolean
  autoBuyTriggeredImmediately?: boolean
  constantMultipleSellTriggerCloseToStopLossTrigger?: boolean
  stopLossTriggerCloseToConstantMultipleSellTrigger?: boolean
  addingConstantMultipleWhenAutoSellOrBuyEnabled?: boolean
  constantMultipleAutoSellTriggeredImmediately?: boolean
  constantMultipleAutoBuyTriggeredImmediately?: boolean
  autoTakeProfitTriggerLowerThanAutoBuyTrigger?: boolean
  autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger?: boolean
  autoBuyTriggerGreaterThanAutoTakeProfit?: boolean
  constantMultipleBuyTriggerGreaterThanAutoTakeProfit?: boolean
  existingTakeProfitTriggerAfterVaultReopen?: boolean
}

export function warningMessagesHandler({
  potentialGenerateAmountLessThanDebtFloor,
  vaultWillBeAtRiskLevelDanger,
  vaultWillBeAtRiskLevelDangerAtNextPrice,
  vaultWillBeAtRiskLevelWarning,
  vaultWillBeAtRiskLevelWarningAtNextPrice,
  debtIsLessThanDebtFloor,
  potentialInsufficientEthFundsForTx,
  currentCollRatioCloseToStopLoss,
  noMinSellPriceWhenStopLossEnabled,
  settingAutoBuyTriggerWithNoThreshold,
  autoSellTriggerCloseToStopLossTrigger,
  autoSellTargetCloseToAutoBuyTrigger,
  stopLossTriggerCloseToAutoSellTrigger,
  autoBuyTargetCloseToStopLossTrigger,
  autoBuyTargetCloseToAutoSellTrigger,
  autoSellTriggeredImmediately,
  autoBuyTriggeredImmediately,
  constantMultipleSellTriggerCloseToStopLossTrigger,
  stopLossTriggerCloseToConstantMultipleSellTrigger,
  addingConstantMultipleWhenAutoSellOrBuyEnabled,
  constantMultipleAutoSellTriggeredImmediately,
  constantMultipleAutoBuyTriggeredImmediately,
  autoTakeProfitTriggerLowerThanAutoBuyTrigger,
  autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger,
  autoBuyTriggerGreaterThanAutoTakeProfit,
  constantMultipleBuyTriggerGreaterThanAutoTakeProfit,
  existingTakeProfitTriggerAfterVaultReopen,
}: WarningMessagesHandler) {
  const warningMessages: VaultWarningMessage[] = []

  if (potentialGenerateAmountLessThanDebtFloor) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (vaultWillBeAtRiskLevelDanger) {
    warningMessages.push('vaultWillBeAtRiskLevelDanger')
  }

  if (vaultWillBeAtRiskLevelDangerAtNextPrice) {
    warningMessages.push('vaultWillBeAtRiskLevelDangerAtNextPrice')
  }

  if (vaultWillBeAtRiskLevelWarning) {
    warningMessages.push('vaultWillBeAtRiskLevelWarning')
  }

  if (vaultWillBeAtRiskLevelWarningAtNextPrice) {
    warningMessages.push('vaultWillBeAtRiskLevelWarningAtNextPrice')
  }

  if (debtIsLessThanDebtFloor) {
    warningMessages.push('debtIsLessThanDebtFloor')
  }

  if (potentialInsufficientEthFundsForTx) {
    warningMessages.push('potentialInsufficientEthFundsForTx')
  }

  if (currentCollRatioCloseToStopLoss) {
    warningMessages.push('currentCollRatioCloseToStopLoss')
  }

  if (noMinSellPriceWhenStopLossEnabled) {
    warningMessages.push('noMinSellPriceWhenStopLossEnabled')
  }

  if (settingAutoBuyTriggerWithNoThreshold) {
    warningMessages.push('settingAutoBuyTriggerWithNoThreshold')
  }
  if (autoSellTriggerCloseToStopLossTrigger) {
    warningMessages.push('autoSellTriggerCloseToStopLossTrigger')
  }

  if (autoSellTargetCloseToAutoBuyTrigger) {
    warningMessages.push('autoSellTargetCloseToAutoBuyTrigger')
  }

  if (stopLossTriggerCloseToAutoSellTrigger) {
    warningMessages.push('stopLossTriggerCloseToAutoSellTrigger')
  }

  if (autoBuyTargetCloseToStopLossTrigger) {
    warningMessages.push('autoBuyTargetCloseToStopLossTrigger')
  }

  if (autoBuyTargetCloseToAutoSellTrigger) {
    warningMessages.push('autoBuyTargetCloseToAutoSellTrigger')
  }

  if (autoBuyTriggeredImmediately) {
    warningMessages.push('autoBuyTriggeredImmediately')
  }

  if (autoSellTriggeredImmediately) {
    warningMessages.push('autoSellTriggeredImmediately')
  }

  if (constantMultipleSellTriggerCloseToStopLossTrigger) {
    warningMessages.push('constantMultipleSellTriggerCloseToStopLossTrigger')
  }

  if (stopLossTriggerCloseToConstantMultipleSellTrigger) {
    warningMessages.push('stopLossTriggerCloseToConstantMultipleSellTrigger')
  }

  if (addingConstantMultipleWhenAutoSellOrBuyEnabled) {
    warningMessages.push('addingConstantMultipleWhenAutoSellOrBuyEnabled')
  }

  if (constantMultipleAutoSellTriggeredImmediately) {
    warningMessages.push('constantMultipleAutoSellTriggeredImmediately')
  }

  if (constantMultipleAutoBuyTriggeredImmediately) {
    warningMessages.push('constantMultipleAutoBuyTriggeredImmediately')
  }

  if (autoTakeProfitTriggerLowerThanAutoBuyTrigger) {
    warningMessages.push('autoTakeProfitTriggerLowerThanAutoBuyTrigger')
  }

  if (autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger) {
    warningMessages.push('autoTakeProfitTriggerLowerThanConstantMultipleBuyTrigger')
  }

  if (autoBuyTriggerGreaterThanAutoTakeProfit) {
    warningMessages.push('autoBuyTriggerGreaterThanAutoTakeProfit')
  }

  if (constantMultipleBuyTriggerGreaterThanAutoTakeProfit) {
    warningMessages.push('constantMultipleBuyTriggerGreaterThanAutoTakeProfit')
  }

  if (existingTakeProfitTriggerAfterVaultReopen) {
    warningMessages.push('existingTakeProfitTriggerAfterVaultReopen')
  }

  return warningMessages
}
