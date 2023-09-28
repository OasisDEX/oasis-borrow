import BigNumber from 'bignumber.js'
import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'

export const getProductEarnNavItems = (
  promoCards: ProductHubPromoCards,
  productHub: ProductHubItem[],
) => {
  const data: ProductHubItem[] = []

  promoCards.earn.default.forEach((promoCard) => {
    const foundItem = productHub.find(
      (item) =>
        (!item.reverseTokens
          ? item.primaryToken === promoCard.tokens?.[0] &&
            item.secondaryToken === (promoCard.tokens?.[1] || promoCard.tokens?.[0])
          : item.primaryToken === promoCard.tokens?.[1] &&
            item.secondaryToken === (promoCard.tokens?.[0] || promoCard.tokens?.[1])) &&
        item.network === promoCard.protocol?.network &&
        item.protocol === promoCard.protocol.protocol &&
        item.product.includes(ProductHubProductType.Earn),
    )
    if (foundItem) data.push(foundItem)
  })

  return data.map((item) => ({
    weeklyNetApy: item.weeklyNetApy ? new BigNumber(item.weeklyNetApy) : undefined,
    primaryToken: item.primaryToken,
    secondaryToken: item.secondaryToken,
    protocol: item.protocol,
    network: item.network,
    earnStrategy: item.earnStrategy,
    earnStrategyDescription: item.earnStrategyDescription,
    reverseTokens: item.reverseTokens,
  }))
}
