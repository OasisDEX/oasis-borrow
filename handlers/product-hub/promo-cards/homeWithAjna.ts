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
    promoCardETHUSDCAaveV3EthereumMultiply,
    promoCardWBTCUSDCAaveV3EthereumMultiply,
    promoCardWSTETHUSDCAaveV3EthereumMultiply,
    promoCardETHUSDCAaveV3OptimismMultiply,
    promoCardWBTCUSDCAaveV3OptimismMultiply,
    promoCardWSTETHUSDCAaveV3EthereumEarn,
  } = getAaveV3PromoCards(table)
  const {
    promoCardETHUSDCAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
  } = getAjnaPromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
      tokens: {
        ETH: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
        WBTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardWBTCUSDCAjnaBorrow],
        USDC: [promoCardUSDCETHAjnaBorrow, promoCardUSDCWBTCAjnaBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardETHUSDCAaveV3EthereumMultiply,
        promoCardWBTCUSDCAaveV3OptimismMultiply,
        promoCardETHBMakerMultiply,
      ],
      tokens: {
        ETH: [
          promoCardETHUSDCAaveV3EthereumMultiply,
          promoCardWSTETHAMakerMultiply,
          promoCardETHUSDCAaveV3OptimismMultiply,
        ],
        WBTC: [
          promoCardWBTCBMakerMultiply,
          promoCardWBTCUSDCAaveV3EthereumMultiply,
          promoCardWBTCUSDCAaveV3OptimismMultiply,
        ],
        USDC: [
          promoCardETHUSDCAaveV3EthereumMultiply,
          promoCardWSTETHUSDCAaveV3EthereumMultiply,
          promoCardWBTCUSDCAaveV3EthereumMultiply,
        ],
        DAI: [
          promoCardWSTETHAMakerMultiply,
          promoCardETHBMakerMultiply,
          promoCardWBTCBMakerMultiply,
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
      },
    },
  }
}
