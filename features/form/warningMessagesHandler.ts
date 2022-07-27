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
  | 'basicSellTriggerCloseToStopLossTrigger'
  | 'basicSellTargetCloseToAutoBuyTrigger'
  | 'stopLossTriggerCloseToAutoSellTrigger'
  | 'autoBuyTargetCloseToStopLossTrigger'
  | 'autoBuyTargetCloseToAutoSellTrigger'
  | 'autoBuyTriggeredImmediately'
  | 'autoSellTriggeredImmediately'
  | 'autoSellOverride'

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
  basicSellTriggerCloseToStopLossTrigger?: boolean
  basicSellTargetCloseToAutoBuyTrigger?: boolean
  stopLossTriggerCloseToAutoSellTrigger?: boolean
  autoBuyTargetCloseToStopLossTrigger?: boolean
  autoBuyTargetCloseToAutoSellTrigger?: boolean
  autoSellTriggeredImmediately?: boolean
  autoBuyTriggeredImmediately?: boolean
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
  basicSellTriggerCloseToStopLossTrigger,
  basicSellTargetCloseToAutoBuyTrigger,
  stopLossTriggerCloseToAutoSellTrigger,
  autoBuyTargetCloseToStopLossTrigger,
  autoBuyTargetCloseToAutoSellTrigger,
  autoSellTriggeredImmediately,
  autoBuyTriggeredImmediately,
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
  if (basicSellTriggerCloseToStopLossTrigger) {
    warningMessages.push('basicSellTriggerCloseToStopLossTrigger')
  }

  if (basicSellTargetCloseToAutoBuyTrigger) {
    warningMessages.push('basicSellTargetCloseToAutoBuyTrigger')
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

  // if (highSlippage) {
  //   warningMessages.push('highSlippage')
  // }

  // if (customSlippageOverridden) {
  //   warningMessages.push('customSlippageOverridden')
  // }

  return warningMessages
}
