import { useTranslation } from 'next-i18next'

export const getHistoryEventLabel = ({
  kindWithVersion,
  isOpen,
  collateralToken,
  quoteToken,
}: {
  kindWithVersion?: string
  collateralToken?: string
  quoteToken?: string
  isOpen?: boolean
}) => {
  const { t } = useTranslation()

  const kind = kindWithVersion?.split('_')[0]

  // const x = handleAutomationKinds(kind)

  switch (kind) {
    case 'AjnaDeposit':
    case 'MorphoBlueDeposit':
    case 'AjnaSupplyQuote':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit')
    case 'AjnaDepositBorrow':
    case 'MorphoBlueDepositBorrow':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit-generate')
    case 'MorphoBlueOpenPosition':
    case 'MorphoBlueOpenDepositBorrow':
    case 'AjnaOpenMultiplyPosition':
    case 'AAVEOpenDepositBorrow':
    case 'SparkOpenDepositBorrow':
    case 'OpenAAVEPosition':
    case 'SparkOpenPosition':
    case 'AjnaSupplyQuoteMintNftAndStake':
      return t('position-history.open-position')
    case 'AjnaWithdraw':
    case 'AjnaWithdrawQuote':
    case 'AjnaWithdrawQuoteNft':
    case 'AjnaUnstakeNftAndWithdrawQuote':
    case 'MorphoBlueWithdraw':
      return t('position-history.withdraw')
    case 'AjnaBorrow':
    case 'MorphoBlueBorrow':
      return t('position-history.generate')
    case 'AjnaRepay':
    case 'MorphoBluePayback':
      return t('position-history.repay')

    case 'AjnaRepayWithdraw':
    case 'MorphoBluePaybackWithdraw':
    case 'AAVEPaybackWithdraw':
    case 'SparkPaybackWithdraw':
      return t('position-history.repay-withdraw')
    case 'AjnaAdjustRiskUp':
    case 'SparkAdjustRiskUp':
    case 'MorphoBlueAdjustRiskUp':
    case 'IncreaseAAVEPosition':
      return t('position-history.increase-multiple')
    case 'AjnaAdjustRiskDown':
    case 'SparkAdjustRiskDown':
    case 'MorphoBlueAdjustRiskDown':
    case 'DecreaseAAVEPosition':
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
    case 'SparkDeposit':
      return t('position-history.deposit')
    case 'AjnaUnstakeNftAndClaimCollateral':
      return t('position-history.claim-collateral')
    case 'SparkDepositBorrow':
      return t('position-history.deposit-generate')
    case 'AAVEBorrow':
    case 'SparkBorrow':
      return t('position-history.borrow')

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
    case 'AutomationRemoved-AaveBasicBuyV2':
      return t('position-history.automation.basic-buy-removed')
    case 'AutomationRemoved-AaveBasicSellV2':
      return t('position-history.automation.basic-sell-removed')
    case 'AutomationAdded-AaveBasicBuyV2':
      return t('position-history.automation.basic-buy-added')
    case 'AutomationAdded-AaveBasicSellV2':
      return t('position-history.automation.basic-sell-added')
    case 'AutomationExecuted-AaveBasicBuyV2':
      return t('position-history.automation.basic-buy-executed')
    case 'AutomationExecuted-AaveBasicSellV2':
      return t('position-history.automation.basic-sell-executed')
    case 'Liquidation':
      return t('position-history.liquidation')
    default:
      return `${t('position-history.event')} ${kind || ''}`
  }
}

// const automationTypes = {
//   'StopLossToCollateral': {
//     token: 'collateralToken',
//     translations: {
//       'Added': 'position-history.automation.stop-loss-token-added',
//       'Executed': 'position-history.automation.stop-loss-token-executed',
//       'Removed': 'position-history.automation.stop-loss-token-removed',
//     },
//   },
//   'StopLossToDebt': {
//     token: 'quoteToken',
//     translations: {
//       'Added': 'position-history.automation.stop-loss-token-added',
//       'Executed': 'position-history.automation.stop-loss-token-executed',
//       'Removed': 'position-history.automation.stop-loss-token-removed',
//     },
//   },
//   'BasicBuy': {
//     translations: {
//       'Added': 'position-history.automation.basic-buy-added',
//       'Executed': 'position-history.automation.basic-buy-executed',
//       'Removed': 'position-history.automation.basic-buy-removed',
//     },
//   },
//   'BasicSell': {
//     translations: {
//       'Added': 'position-history.automation.basic-sell-added',
//       'Executed': 'position-history.automation.basic-sell-executed',
//       'Removed': 'position-history.automation.basic-sell-removed',
//     },
//   } ,
// };

// function handleAutomationKinds(kind: string) {
//   const automationType = Object.keys(automationTypes).find((key) => kind.includes(key));
//   if (automationType) {
//     const automationKind = automationTypes[automationType as keyof typeof automationTypes];
//     const token = automationKind.token ? automationKind.token : '';
//     const translationKey = automationKind.translations[kind.split('_')[1]];
//     if (token) {
//       return (args: any) => {
//         return useTranslation().t(translationKey, { token: args[token] });
//       };
//     } else {
//       return useTranslation().t(translationKey);
//     }
//   }
// }