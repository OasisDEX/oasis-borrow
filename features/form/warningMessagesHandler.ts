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
  | 'nextCollRatioCloseToCurrentSl'

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
  nextCollRatioCloseToCurrentSl?: boolean
}

export function warningMessagesHandler({
  potentialGenerateAmountLessThanDebtFloor,
  vaultWillBeAtRiskLevelDanger,
  vaultWillBeAtRiskLevelDangerAtNextPrice,
  vaultWillBeAtRiskLevelWarning,
  vaultWillBeAtRiskLevelWarningAtNextPrice,
  debtIsLessThanDebtFloor,
  potentialInsufficientEthFundsForTx,
  nextCollRatioCloseToCurrentSl,
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

  if (nextCollRatioCloseToCurrentSl) {
    warningMessages.push('nextCollRatioCloseToCurrentSl')
  }

  // if (highSlippage) {
  //   warningMessages.push('highSlippage')
  // }

  // if (customSlippageOverridden) {
  //   warningMessages.push('customSlippageOverridden')
  // }

  return warningMessages
}
