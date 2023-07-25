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
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardCBETHETHAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardUSDCWBTCAjnaMultiply,
    promoCardWBTCDAIAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHDAIAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardWBTCDAIAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
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
        ]
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardETHUSDCAjnaEarn, promoCardWSTETHDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
      tokens: {
        ETH: [promoCardUSDCETHAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        WBTC: [promoCardUSDCWBTCAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        USDC: [promoCardETHUSDCAjnaEarn, promoCardWBTCUSDCAjnaEarn, promoCardsWhatAreAjnaRewards],
        DAI: [promoCardWSTETHDAIAjnaEarn, promoCardWBTCDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
      },
    },
  }
}
