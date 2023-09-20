import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import {
  getAaveV2PromoCards,
  getAaveV3PromoCards,
  getAjnaPromoCards,
  getMakerPromoCards,
  promoCardEarnOnYourAssets,
  promoCardFullySelfCustodial,
  promoCardLearnAboutBorrow,
  promoCardLearnAboutMultiply,
  promoCardsWhatAreAjnaRewards,
} from 'handlers/product-hub/promo-cards/collections'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const {
    promoCardETHCMakerBorrow,
    promoCardWBTCBMakerBorrow,
    promoCardWBTCCMakerBorrow,
    promoCardWSTETHBMakerBorrow,
    promoCardETHBMakerMultiply,
    promoCardWBTCBMakerMultiply,
    promoCardWSTETHAMakerMultiply,
    promoCardDsrMakerEarn,
  } = getMakerPromoCards(table)
  const { promoCardSTETHUSDCAaveV2Earn } = getAaveV2PromoCards(table)
  const {
    promoCardWBTCUSDCAaveV3EthereumMultiply,
    promoCardWSTETHUSDCAaveV3EthereumMultiply,
    promoCardETHUSDCAaveV3OptimismMultiply,
    promoCardWBTCUSDCAaveV3OptimismMultiply,
    promoCardWSTETHUSDCAaveV3EthereumEarn,
  } = getAaveV3PromoCards(table)
  const {
    promoCardETHUSDCAjnaBorrow,
    promoCardGHODAIAjnaBorrow,
    promoCardSDAIUSDCAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardWLDUSDCAjnaBorrow,
    promoCardYFIDAIAjnaBorrow,
    promoCardETHGHOAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardWBTCGHOAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHGHOAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardYFIDAIAjnaMultiply,
    promoCardCBETHGHOAjnaEarn,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardUSDCWLDAjnaEarn,
    promoCardWBTCGHOAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
    promoCardWSTETHGHOAjnaEarn,
  } = getAjnaPromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
      tokens: {
        ETH: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
        BTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardWBTCUSDCAjnaBorrow],
        USDC: [promoCardUSDCETHAjnaBorrow, promoCardUSDCWBTCAjnaBorrow, promoCardLearnAboutBorrow],
        DAI: [promoCardSDAIUSDCAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
        YFI: [promoCardYFIDAIAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
        GHO: [promoCardGHODAIAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
        WLD: [promoCardWLDUSDCAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardWSTETHUSDCAjnaMultiply,
        promoCardWBTCUSDCAaveV3OptimismMultiply,
        promoCardETHBMakerMultiply,
      ],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAjnaMultiply,
          promoCardWSTETHAMakerMultiply,
          promoCardETHUSDCAaveV3OptimismMultiply,
        ],
        BTC: [
          promoCardWBTCBMakerMultiply,
          promoCardWBTCUSDCAjnaMultiply,
          promoCardWBTCUSDCAaveV3OptimismMultiply,
        ],
        USDC: [
          promoCardUSDCETHAjnaMultiply,
          promoCardWSTETHUSDCAaveV3EthereumMultiply,
          promoCardWBTCUSDCAaveV3EthereumMultiply,
        ],
        DAI: [
          promoCardWSTETHAMakerMultiply,
          promoCardETHBMakerMultiply,
          promoCardWBTCBMakerMultiply,
        ],
        YFI: [
          promoCardYFIDAIAjnaMultiply,
          promoCardLearnAboutMultiply,
          promoCardsWhatAreAjnaRewards,
        ],
        GHO: [
          promoCardETHGHOAjnaMultiply,
          promoCardWSTETHGHOAjnaMultiply,
          promoCardWBTCGHOAjnaMultiply,
        ],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [
        promoCardDsrMakerEarn,
        promoCardWSTETHUSDCAaveV3EthereumEarn,
        promoCardETHUSDCAjnaEarn,
      ],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAaveV3EthereumEarn,
          promoCardSTETHUSDCAaveV2Earn,
          promoCardUSDCETHAjnaEarn,
        ],
        BTC: [promoCardUSDCWBTCAjnaEarn, promoCardEarnOnYourAssets, promoCardFullySelfCustodial],
        USDC: [promoCardETHUSDCAjnaEarn, promoCardWBTCUSDCAjnaEarn, promoCardEarnOnYourAssets],
        DAI: [promoCardDsrMakerEarn, promoCardWSTETHDAIAjnaEarn, promoCardEarnOnYourAssets],
        GHO: [promoCardWSTETHGHOAjnaEarn, promoCardCBETHGHOAjnaEarn, promoCardWBTCGHOAjnaEarn],
        WLD: [promoCardUSDCWLDAjnaEarn, promoCardEarnOnYourAssets, promoCardsWhatAreAjnaRewards],
      },
    },
  }
}
