import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import {
  getAaveV2PromoCards,
  getAaveV3PromoCards,
  getMakerPromoCards,
  promoCardEarnOnYourAssets,
  promoCardFullySelfCustodial,
  promoCardLearnAboutBorrow,
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
    promoCardETHUSDCAaveV3EthereumMultiply,
    promoCardWBTCUSDCAaveV3EthereumMultiply,
    promoCardWSTETHUSDCAaveV3EthereumMultiply,
    promoCardETHUSDCAaveV3OptimismMultiply,
    promoCardWBTCUSDCAaveV3ArbitrumMultiply,
    promoCardWSTETHUSDCAaveV3EthereumEarn,
  } = getAaveV3PromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardWBTCCMakerBorrow],
      tokens: {
        ETH: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardRETHAMakerBorrow],
        BTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardETHUSDCAaveV3EthereumMultiply,
        promoCardWBTCUSDCAaveV3ArbitrumMultiply,
        promoCardETHBMakerMultiply,
      ],
      tokens: {
        ETH: [
          promoCardETHUSDCAaveV3EthereumMultiply,
          promoCardWSTETHAMakerMultiply,
          promoCardETHUSDCAaveV3OptimismMultiply,
        ],
        BTC: [
          promoCardWBTCBMakerMultiply,
          promoCardWBTCUSDCAaveV3EthereumMultiply,
          promoCardWBTCUSDCAaveV3ArbitrumMultiply,
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
        promoCardSTETHUSDCAaveV2Earn,
      ],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAaveV3EthereumEarn,
          promoCardSTETHUSDCAaveV2Earn,
          promoCardEarnOnYourAssets,
        ],
        DAI: [promoCardDsrMakerEarn, promoCardEarnOnYourAssets, promoCardFullySelfCustodial],
      },
    },
  }
}
