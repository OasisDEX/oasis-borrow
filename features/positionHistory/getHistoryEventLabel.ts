import { useTranslation } from 'next-i18next'

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

  switch (kind) {
    // Borrowish
    case 'AjnaDeposit':
    case 'MorphoBlueDeposit':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit')
    case 'MorphoBlueOpenPosition':
    case 'MorphoBlueOpenDepositBorrow':
      return t('position-history.open-position')
    case 'AjnaWithdraw':
    case 'MorphoBlueWithdraw':
      return t('position-history.withdraw')
    case 'AjnaBorrow':
    case 'MorphoBlueBorrow':
      return t('position-history.generate')
    case 'AjnaRepay':
    case 'MorphoBluePayback':
      return t('position-history.repay')
    case 'AjnaDepositBorrow':
    case 'MorphoBlueDepositBorrow':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit-generate')
    case 'AjnaRepayWithdraw':
    case 'MorphoBluePaybackWithdraw':
      return t('position-history.repay-withdraw')
    case 'AjnaOpenMultiplyPosition_4':
    case 'AjnaOpenMultiplyPosition_5':
      return t('position-history.open-position')
    case 'AjnaAdjustRiskUp_4':
    case 'AjnaAdjustRiskUp_5':
    case 'SparkAdjustRiskUp':
    case 'MorphoBlueAdjustRiskUp':
      return t('position-history.increase-multiple')
    case 'AjnaAdjustRiskDown_4':
    case 'AjnaAdjustRiskDown_5':
    case 'SparkAdjustRiskDown':
    case 'MorphoBlueAdjustRiskDown':
      return t('position-history.decrease-multiple')
    case 'AjnaCloseToQuotePosition_4':
    case 'AjnaCloseToQuotePosition_5':
    case 'AjnaCloseToCollateralPosition_4':
    case 'AjnaCloseToCollateralPosition_5':
    case 'MorphoBlueClosePosition':
      return t('position-history.close-position')
    case 'Kick':
      return t('position-history.auction-started')
    case 'AuctionSettle':
      return t('position-history.auction-settled')

    // Earn
    case 'AjnaMoveQuote':
    case 'AjnaMoveQuoteNft':
      return t('position-history.move-lending-price')
    case 'AjnaSupplyAndMoveQuote':
    case 'AjnaSupplyAndMoveQuoteNft':
      return t('position-history.deposit-and-move-lending-price')
    case 'AjnaWithdrawAndMoveQuote':
    case 'AjnaWithdrawAndMoveQuoteNft':
      return t('position-history.withdraw-and-move-lending-price')
    case 'AjnaSupplyQuote':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit')
    case 'AjnaSupplyQuoteNft':
      return t('position-history.deposit')
    case 'AjnaWithdrawQuote':
    case 'AjnaWithdrawQuoteNft':
    case 'AjnaUnstakeNftAndWithdrawQuote':
      return t('position-history.withdraw')
    case 'AjnaUnstakeNftAndClaimCollateral':
      return t('position-history.claim-collateral')
    case 'AjnaSupplyQuoteMintNftAndStake':
      return t('position-history.open-position')

    // Aave
    case 'AAVEDeposit':
    case 'SparkDeposit':
      return t('position-history.deposit')
    case 'SparkDepositBorrow':
      return t('position-history.deposit-generate')
    case 'AAVEPaybackWithdraw':
    case 'SparkPaybackWithdraw':
      return t('position-history.repay-withdraw')
    case 'AAVEBorrow':
    case 'SparkBorrow':
      return t('position-history.borrow')
    case 'AAVEOpenDepositBorrow':
    case 'SparkOpenDepositBorrow':
      return t('position-history.open-position')
    case 'CloseAAVEPosition':
    case 'CloseAAVEV3Position_3':
    case 'SparkClosePosition':
      return t('position-history.close-position')
    case 'IncreaseAAVEPosition':
      return t('position-history.increase-multiple')
    case 'OpenAAVEPosition':
    case 'SparkOpenPosition':
      return t('position-history.open-position')
    case 'DecreaseAAVEPosition':
      return t('position-history.decrease-multiple')
    case 'AutomationAdded-AaveStopLossToCollateralV2':
    case 'AutomationAdded-SparkStopLossToCollateralV2':
      return collateralToken
        ? t('position-history.automation.stop-loss-token-added', { token: collateralToken })
        : t('position-history.automation.stop-loss-collateral-added')
    case 'AutomationExecuted-AaveStopLossToCollateralV2':
    case 'AutomationExecuted-SparkStopLossToCollateralV2':
      return collateralToken
        ? t('position-history.automation.stop-loss-token-executed', { token: collateralToken })
        : t('position-history.automation.stop-loss-collateral-executed')
    case 'AutomationRemoved-AaveStopLossToCollateralV2':
    case 'AutomationRemoved-SparkStopLossToCollateralV2':
      return collateralToken
        ? t('position-history.automation.stop-loss-token-removed', { token: collateralToken })
        : t('position-history.automation.stop-loss-collateral-removed')
    case 'AutomationAdded-AaveStopLossToDebtV2':
    case 'AutomationAdded-SparkStopLossToDebtV2':
      return quoteToken
        ? t('position-history.automation.stop-loss-token-added', { token: quoteToken })
        : t('position-history.automation.stop-loss-debt-added')
    case 'AutomationExecuted-AaveStopLossToDebtV2':
    case 'AutomationExecuted-SparkStopLossToDebtV2':
      return quoteToken
        ? t('position-history.automation.stop-loss-token-executed', { token: quoteToken })
        : t('position-history.automation.stop-loss-debt-executed')
    case 'AutomationRemoved-AaveStopLossToDebtV2':
    case 'AutomationRemoved-SparkStopLossToDebtV2':
      return quoteToken
        ? t('position-history.automation.stop-loss-token-removed', { token: quoteToken })
        : t('position-history.automation.stop-loss-debt-removed')
    case 'Liquidation':
    case 'Liquidate':
      return t('position-history.liquidation')
    default:
      return `${t('position-history.event')} ${kind || ''}`
  }
}
