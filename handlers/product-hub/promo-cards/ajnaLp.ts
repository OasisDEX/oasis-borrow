import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  getAjnaPromoCards,
  promoCardHowToUseBorrowOnAjna,
  promoCardsWhatAreAjnaRewards,
  promoCardWhatIsEarnOnAjna,
} from 'handlers/product-hub/promo-cards/collections'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const {
    promoCardETHDAIAjnaBorrow,
    promoCardETHUSDCAjnaBorrow,
    promoCardGHODAIAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardWLDUSDCAjnaBorrow,
    promoCardCBETHETHAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardUSDCWBTCAjnaMultiply,
    promoCardWBTCDAIAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHDAIAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardCBETHGHOCAjnaEarn,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardUSDCWLDAjnaEarn,
    promoCardWBTCDAIAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
    promoCardWSTETHGHOAjnaEarn,
  } = getAjnaPromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [
        promoCardETHUSDCAjnaBorrow,
        promoCardWBTCUSDCAjnaBorrow,
        promoCardsWhatAreAjnaRewards,
      ],
      tokens: {
        ETH: [promoCardETHUSDCAjnaBorrow, promoCardETHDAIAjnaBorrow, promoCardsWhatAreAjnaRewards],
        WBTC: [
          promoCardWBTCUSDCAjnaBorrow,
          promoCardHowToUseBorrowOnAjna,
          promoCardsWhatAreAjnaRewards,
        ],
        USDC: [
          promoCardUSDCETHAjnaBorrow,
          promoCardUSDCWBTCAjnaBorrow,
          promoCardsWhatAreAjnaRewards,
        ],
        GHO: [
          promoCardGHODAIAjnaBorrow,
          promoCardHowToUseBorrowOnAjna,
          promoCardsWhatAreAjnaRewards,
        ],
        WLD: [
          promoCardWLDUSDCAjnaBorrow,
          promoCardHowToUseBorrowOnAjna,
          promoCardsWhatAreAjnaRewards,
        ],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardWSTETHUSDCAjnaMultiply,
        promoCardWBTCUSDCAjnaMultiply,
        promoCardsWhatAreAjnaRewards,
      ],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAjnaMultiply,
          promoCardCBETHETHAjnaMultiply,
          promoCardsWhatAreAjnaRewards,
        ],
        WBTC: [
          promoCardWBTCUSDCAjnaMultiply,
          promoCardWBTCDAIAjnaMultiply,
          promoCardsWhatAreAjnaRewards,
        ],
        USDC: [
          promoCardUSDCETHAjnaMultiply,
          promoCardUSDCWBTCAjnaMultiply,
          promoCardsWhatAreAjnaRewards,
        ],
        DAI: [
          promoCardWBTCDAIAjnaMultiply,
          promoCardWSTETHDAIAjnaMultiply,
          promoCardsWhatAreAjnaRewards,
        ],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardETHUSDCAjnaEarn, promoCardWSTETHDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
      tokens: {
        ETH: [promoCardUSDCETHAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        WBTC: [promoCardUSDCWBTCAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        USDC: [promoCardETHUSDCAjnaEarn, promoCardWBTCUSDCAjnaEarn, promoCardsWhatAreAjnaRewards],
        DAI: [promoCardWSTETHDAIAjnaEarn, promoCardWBTCDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
        GHO: [promoCardCBETHGHOCAjnaEarn, promoCardWSTETHGHOAjnaEarn, promoCardsWhatAreAjnaRewards],
        WLD: [promoCardUSDCWLDAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
      },
    },
  }
}
