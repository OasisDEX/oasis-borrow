import { useTranslation } from 'next-i18next'

export const getHistoryEventLabel = ({ kind, isOpen }: { kind?: string; isOpen?: boolean }) => {
  const { t } = useTranslation()

  switch (kind) {
    // Borrowish
    case 'AjnaDeposit':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit')
    case 'AjnaWithdraw':
      return t('position-history.withdraw')
    case 'AjnaBorrow':
      return t('position-history.generate')
    case 'AjnaRepay':
      return t('position-history.repay')
    case 'AjnaDepositBorrow':
      return isOpen ? t('position-history.open-position') : t('position-history.deposit-generate')
    case 'AjnaRepayWithdraw':
      return t('position-history.repay-withdraw')
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
    default:
      return t('position-history.event')
  }
}
