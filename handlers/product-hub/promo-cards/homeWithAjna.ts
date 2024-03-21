import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import {
  getAaveV2PromoCards,
  getAaveV3PromoCards,
  getAjnaPromoCards,
  getMakerPromoCards,
  getSteakhousePromoCards,
  promoCardEarnOnYourAssets,
  promoCardFullySelfCustodial,
  promoCardLearnAboutBorrow,
  promoCardLearnAboutMultiply,
  promoCardsWhatAreAjnaRewards,
} from 'handlers/product-hub/promo-cards/collections'
import { useAppConfig } from 'helpers/config'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const { Erc4626Vaults: erc4626VaultsEnabled } = useAppConfig('features')

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
    promoCardSDAIUSDCAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardYFIDAIAjnaBorrow,
    promoCardUSDCETHAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardYFIDAIAjnaMultiply,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
  } = getAjnaPromoCards(table)
  const { promoUSDCErc4626Steakhouse } = getSteakhousePromoCards(table)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
      tokens: {
        ETH: [promoCardETHCMakerBorrow, promoCardWSTETHBMakerBorrow, promoCardETHUSDCAjnaBorrow],
        BTC: [promoCardWBTCCMakerBorrow, promoCardWBTCBMakerBorrow, promoCardWBTCUSDCAjnaBorrow],
        USDC: [promoCardUSDCETHAjnaBorrow, promoCardUSDCWBTCAjnaBorrow, promoCardLearnAboutBorrow],
        DAI: [promoCardSDAIUSDCAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
        YFI: [promoCardYFIDAIAjnaBorrow, promoCardLearnAboutBorrow, promoCardsWhatAreAjnaRewards],
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
      },
    },
    [ProductHubProductType.Earn]: {
      default: [
        ...(erc4626VaultsEnabled ? [promoUSDCErc4626Steakhouse] : []),
        promoCardDsrMakerEarn,
        promoCardWSTETHUSDCAaveV3EthereumEarn,
        ...(!erc4626VaultsEnabled ? [promoCardETHUSDCAjnaEarn] : []),
      ],
      tokens: {
        ETH: [
          ...(erc4626VaultsEnabled ? [promoUSDCErc4626Steakhouse] : []),
          promoCardWSTETHUSDCAaveV3EthereumEarn,
          promoCardSTETHUSDCAaveV2Earn,
          ...(!erc4626VaultsEnabled ? [promoCardUSDCETHAjnaEarn] : []),
        ],
        BTC: [
          ...(erc4626VaultsEnabled ? [promoUSDCErc4626Steakhouse] : []),
          promoCardUSDCWBTCAjnaEarn,
          promoCardEarnOnYourAssets,
          ...(!erc4626VaultsEnabled ? [promoCardFullySelfCustodial] : []),
        ],
        USDC: [
          ...(erc4626VaultsEnabled ? [promoUSDCErc4626Steakhouse] : []),
          promoCardETHUSDCAjnaEarn,
          promoCardWBTCUSDCAjnaEarn,
          ...(!erc4626VaultsEnabled ? [promoCardEarnOnYourAssets] : []),
        ],
        DAI: [
          ...(erc4626VaultsEnabled ? [promoUSDCErc4626Steakhouse] : []),
          promoCardDsrMakerEarn,
          promoCardWSTETHDAIAjnaEarn,
          ...(!erc4626VaultsEnabled ? [promoCardEarnOnYourAssets] : []),
        ],
      },
    },
  }
}
