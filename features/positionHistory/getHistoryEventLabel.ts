import { useTranslation } from 'next-i18next'
import type { TranslationType } from 'ts_modules/i18next'

export const getHistoryEventLabel = ({
  kind,
  isOpen,
  collateralToken,
  quoteToken,
}: {
  kind?: string
  collateralToken?: string
  quoteToken?: string
  isOpen?: boolean
}) => {
  const { t } = useTranslation()

  const isAutomation = kind?.includes('Automation')

  if (isAutomation && kind) {
    return handleAutomationKinds(kind, t, collateralToken, quoteToken)
  }

  const isRefinance = kind?.includes('Refinance')

  if (isRefinance) {
    return t('refinance.title')
  }

  const isLiquidation = kind?.includes('Liquidation')

  if (isLiquidation) {
    return t('position-history.liquidation')
  }

  const kindWithoutVersion = kind?.split('_')[0]

  switch (kindWithoutVersion) {
    case 'AjnaDeposit':
    case 'MorphoBlueDeposit':
    case 'AjnaSupplyQuote':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit')
    case 'AjnaDepositBorrow':
    case 'AAVEDepositBorrow':
    case 'AAVEV3DepositBorrow':
    case 'MorphoBlueDepositBorrow':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit-generate')
    case 'MorphoBlueOpenPosition':
    case 'MorphoBlueOpenDepositBorrow':
    case 'AjnaOpenMultiplyPosition':
    case 'AAVEOpenDepositBorrow':
    case 'AAVEV3OpenDepositBorrow':
    case 'SparkOpenDepositBorrow':
    case 'OpenAAVEPosition':
    case 'OpenAAVEV3Position':
    case 'SparkOpenPosition':
    case 'AjnaSupplyQuoteMintNftAndStake':
      return t('position-history.open-position')
    case 'AjnaWithdraw':
    case 'AjnaWithdrawQuote':
    case 'AjnaWithdrawQuoteNft':
    case 'AjnaUnstakeNftAndWithdrawQuote':
    case 'MorphoBlueWithdraw':
    case 'AAVEV3Withdraw':
    case 'ERC4626Withdraw':
      return t('position-history.withdraw')
    case 'AAVEV3WithdrawToDebt':
      return t('position-history.withdraw-to-debt')
    case 'AjnaBorrow':
    case 'MorphoBlueBorrow':
      return t('position-history.generate')
    case 'AjnaRepay':
    case 'MorphoBluePayback':
      return t('position-history.repay')
    case 'AjnaRepayWithdraw':
    case 'MorphoBluePaybackWithdraw':
    case 'AAVEPaybackWithdraw':
    case 'AAVEV3PaybackWithdraw':
    case 'SparkPaybackWithdraw':
      return t('position-history.repay-withdraw')
    case 'AjnaAdjustRiskUp':
    case 'SparkAdjustRiskUp':
    case 'MorphoBlueAdjustRiskUp':
    case 'IncreaseAAVEPosition':
    case 'IncreaseAAVEV3Position':
    case 'AdjustRiskUpAAVEV3Position':
      return t('position-history.increase-multiple')
    case 'AjnaAdjustRiskDown':
    case 'SparkAdjustRiskDown':
    case 'MorphoBlueAdjustRiskDown':
    case 'DecreaseAAVEPosition':
    case 'DecreaseAAVEV3Position':
    case 'AdjustRiskDownAAVEV3Position':
      return t('position-history.decrease-multiple')
    case 'AjnaCloseToQuotePosition':
    case 'AjnaCloseToCollateralPosition':
    case 'MorphoBlueClosePosition':
    case 'CloseAAVEPosition':
    case 'CloseAAVEV3Position':
    case 'SparkClosePosition':
      return t('position-history.close-position')
    case 'Kick':
      return t('position-history.auction-started')
    case 'AuctionSettle':
      return t('position-history.auction-settled')
    case 'AjnaMoveQuote':
    case 'AjnaMoveQuoteNft':
      return t('position-history.move-lending-price')
    case 'AjnaSupplyAndMoveQuote':
    case 'AjnaSupplyAndMoveQuoteNft':
      return t('position-history.deposit-and-move-lending-price')
    case 'AjnaWithdrawAndMoveQuote':
    case 'AjnaWithdrawAndMoveQuoteNft':
      return t('position-history.withdraw-and-move-lending-price')
    case 'AjnaSupplyQuoteNft':
    case 'AAVEDeposit':
    case 'AAVEV3Deposit':
    case 'SparkDeposit':
    case 'ERC4626Deposit':
      return t('position-history.deposit')
    case 'ERC4626Transfer':
      return t('position-history.transfer-to')
    case 'AjnaUnstakeNftAndClaimCollateral':
      return t('position-history.claim-collateral')
    case 'SparkDepositBorrow':
      return t('position-history.deposit-generate')
    case 'AAVEBorrow':
    case 'AAVEV3Borrow':
    case 'SparkBorrow':
      return t('position-history.borrow')
    case 'Liquidation':
    case 'Liquidate':
      return t('position-history.liquidation')
    case 'MigrateSparkEOA':
      return t('position-history.migrated-from-protocol', { protocol: 'Spark' })
    case 'MigrateAaveV3EOA':
      return t('position-history.migrated-from-protocol', { protocol: 'Aave' })
    default:
      return `${t('position-history.event')} ${kind || ''}`
  }
}

enum AutomationAction {
  'Added' = 'Added',
  'Executed' = 'Executed',
  'Removed' = 'Removed',
  'Updated' = 'Updated',
}

enum AutomationType {
  'StopLossToDebt' = 'StopLossToDebt',
  'StopLossToCollateral' = 'StopLossToCollateral',
  'BasicBuy' = 'BasicBuy',
  'BasicSell' = 'BasicSell',
  'TrailingStopLoss' = 'TrailingStopLoss',
  'PartialTakeProfit' = 'PartialTakeProfit',
}
function handleAutomationKinds(
  kind: string,
  t: TranslationType,
  collateralToken?: string,
  quoteToken?: string,
) {
  const automationType = kind.split('-')[1]
  const automationAction = kind.split('-')[0]

  if (automationType.includes(AutomationType.StopLossToDebt)) {
    return handleStopLossToDebtLabel(automationAction, t, quoteToken)
  } else if (automationType.includes(AutomationType.StopLossToCollateral)) {
    return handleStopLosstoCollateralLabel(automationAction, t, collateralToken)
  } else if (automationType.includes(AutomationType.BasicBuy)) {
    return handleBasicBuyLabel(automationAction, t)
  } else if (automationType.includes(AutomationType.BasicSell)) {
    return handleBasicSellLabel(automationAction, t)
  } else if (automationType.includes(AutomationType.TrailingStopLoss)) {
    return handleTrailingStopLossLabel(automationAction, t)
  } else if (automationType.includes(AutomationType.PartialTakeProfit)) {
    return handlePartialTakeProfitLabel(automationAction, t)
  }
  console.warn('Automation type not found')
  return undefined
}

function handleStopLossToDebtLabel(
  automationAction: string,
  t: TranslationType,
  quoteToken: string | undefined,
) {
  if (automationAction.includes(AutomationAction.Added)) {
    return quoteToken
      ? t('position-history.automation.stop-loss-token-added', { token: quoteToken })
      : t('position-history.automation.stop-loss-debt-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return quoteToken
      ? t('position-history.automation.stop-loss-token-executed', { token: quoteToken })
      : t('position-history.automation.stop-loss-debt-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return quoteToken
      ? t('position-history.automation.stop-loss-token-removed', { token: quoteToken })
      : t('position-history.automation.stop-loss-debt-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return quoteToken
      ? t('position-history.automation.stop-loss-token-updated', { token: quoteToken })
      : t('position-history.automation.stop-loss-debt-updated')
  }
  console.warn('Automation type not found')
  return undefined
}
function handleStopLosstoCollateralLabel(
  automationAction: string,
  t: TranslationType,
  collateralToken: string | undefined,
) {
  if (automationAction.includes(AutomationAction.Added)) {
    return collateralToken
      ? t('position-history.automation.stop-loss-token-added', { token: collateralToken })
      : t('position-history.automation.stop-loss-collateral-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return collateralToken
      ? t('position-history.automation.stop-loss-token-executed', { token: collateralToken })
      : t('position-history.automation.stop-loss-collateral-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return collateralToken
      ? t('position-history.automation.stop-loss-token-removed', { token: collateralToken })
      : t('position-history.automation.stop-loss-collateral-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return collateralToken
      ? t('position-history.automation.stop-loss-token-updated', { token: collateralToken })
      : t('position-history.automation.stop-loss-collateral-updated')
  }
  console.warn('Automation type not found')
  return undefined
}
function handleTrailingStopLossLabel(automationAction: string, t: TranslationType) {
  if (automationAction.includes(AutomationAction.Added)) {
    return t('position-history.automation.trailing-stop-loss-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return t('position-history.automation.trailing-stop-loss-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return t('position-history.automation.trailing-stop-loss-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return t('position-history.automation.trailing-stop-loss-updated')
  }
  console.warn('Automation type not found')
  return undefined
}

function handleBasicBuyLabel(automationAction: string, t: TranslationType) {
  if (automationAction.includes(AutomationAction.Added)) {
    return t('position-history.automation.basic-buy-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return t('position-history.automation.basic-buy-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return t('position-history.automation.basic-buy-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return t('position-history.automation.basic-buy-updated')
  }
  console.warn('Automation type not found')
  return undefined
}
function handleBasicSellLabel(automationAction: string, t: TranslationType) {
  if (automationAction.includes(AutomationAction.Added)) {
    return t('position-history.automation.basic-sell-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return t('position-history.automation.basic-sell-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return t('position-history.automation.basic-sell-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return t('position-history.automation.basic-sell-updated')
  }
  console.warn('Automation type not found')
  return undefined
}
function handlePartialTakeProfitLabel(automationAction: string, t: TranslationType) {
  if (automationAction.includes(AutomationAction.Added)) {
    return t('position-history.automation.partial-take-profit-added')
  } else if (automationAction.includes(AutomationAction.Executed)) {
    return t('position-history.automation.partial-take-profit-executed')
  } else if (automationAction.includes(AutomationAction.Removed)) {
    return t('position-history.automation.partial-take-profit-removed')
  } else if (automationAction.includes(AutomationAction.Updated)) {
    return t('position-history.automation.partial-take-profit-updated')
  }
  console.warn('Automation type not found')
  return undefined
}
