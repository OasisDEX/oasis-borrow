import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  getAaveV2PromoCards,
  getAaveV3PromoCards,
  getMakerPromoCards,
  promoCardEarnOnYourAssets,
  promoCardFullySelfCustodial,
  promoCardLearnAboutBorrow,
  promoCardLearnAboutMultiply,
} from 'handlers/product-hub/promo-cards/collections'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const {
    promoCardETHCMakerBorrow,
    promoCardRETHAMakerBorrow,
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
    promoCardETHUSDCAaveV3Multiply,
    promoCardRETHUSDCAaveV3Multiply,
    promoCardWBTCUSDCAaveV3Multiply,
    promoCardWSTETHUSDCAaveV3Multiply,
    promoCardWSTETHUSDCAaveV3Earn,
  } = getAaveV3PromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardWBTCCMakerBorrow],
      tokens: {
        ETH: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardRETHAMakerBorrow],
        WBTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardETHUSDCAaveV3Multiply,
        promoCardWBTCUSDCAaveV3Multiply,
        promoCardETHBMakerMultiply,
      ],
      tokens: {
        ETH: [
          promoCardETHUSDCAaveV3Multiply,
          promoCardWSTETHAMakerMultiply,
          promoCardRETHUSDCAaveV3Multiply,
        ],
        WBTC: [
          promoCardWBTCBMakerMultiply,
          promoCardWBTCUSDCAaveV3Multiply,
          promoCardLearnAboutMultiply,
        ],
        USDC: [
          promoCardETHUSDCAaveV3Multiply,
          promoCardWSTETHUSDCAaveV3Multiply,
          promoCardWBTCUSDCAaveV3Multiply,
        ],
        DAI: [
          promoCardWSTETHAMakerMultiply,
          promoCardETHBMakerMultiply,
          promoCardWBTCBMakerMultiply,
        ],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardDsrMakerEarn, promoCardWSTETHUSDCAaveV3Earn, promoCardSTETHUSDCAaveV2Earn],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAaveV3Earn,
          promoCardSTETHUSDCAaveV2Earn,
          promoCardEarnOnYourAssets,
        ],
        DAI: [promoCardDsrMakerEarn, promoCardEarnOnYourAssets, promoCardFullySelfCustodial],
      },
    },
  }
}
