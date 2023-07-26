import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  getAaveV2PromoCards,
  getAaveV3PromoCards,
  getAjnaPromoCards,
  getMakerPromoCards,
  promoCardEarnOnYourAssets,
  promoCardFullySelfCustodial,
  promoCardLearnAboutBorrow,
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
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardWLDUSDCAjnaBorrow,
    promoCardETHGHOAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardUSDCWLDAjnaMultiply,
    promoCardWBTCGHOAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWLDUSDCAjnaMultiply,
    promoCardWSTETHGHOAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardCBETHGHOCAjnaEarn,
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
        WBTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardWBTCUSDCAjnaBorrow],
        USDC: [promoCardUSDCETHAjnaBorrow, promoCardUSDCWBTCAjnaBorrow, promoCardLearnAboutBorrow],
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
        WBTC: [
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
        GHO: [
          promoCardETHGHOAjnaMultiply,
          promoCardWSTETHGHOAjnaMultiply,
          promoCardWBTCGHOAjnaMultiply,
        ],
        WLD: [
          promoCardWLDUSDCAjnaMultiply,
          promoCardUSDCWLDAjnaMultiply,
          promoCardsWhatAreAjnaRewards,
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
        WBTC: [promoCardUSDCWBTCAjnaEarn, promoCardEarnOnYourAssets, promoCardFullySelfCustodial],
        USDC: [promoCardETHUSDCAjnaEarn, promoCardWBTCUSDCAjnaEarn, promoCardEarnOnYourAssets],
        DAI: [promoCardDsrMakerEarn, promoCardWSTETHDAIAjnaEarn, promoCardEarnOnYourAssets],
        GHO: [promoCardWSTETHGHOAjnaEarn, promoCardCBETHGHOCAjnaEarn, promoCardWBTCGHOAjnaEarn],
        WLD: [promoCardUSDCWLDAjnaEarn, promoCardEarnOnYourAssets, promoCardsWhatAreAjnaRewards],
      },
    },
  }
}
