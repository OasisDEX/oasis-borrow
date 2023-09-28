import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'

export const getProductMultiplyNavItems = (
  promoCards: ProductHubPromoCards,
  productHub: ProductHubItem[],
) => {
  const data: ProductHubItem[] = []

  promoCards.multiply.default.forEach((promoCard) => {
    const foundItem = productHub.find(
      (item) =>
        item.primaryToken === promoCard.tokens?.[0] &&
        item.secondaryToken === promoCard.tokens?.[1] &&
        item.network === promoCard.protocol?.network &&
        item.protocol === promoCard.protocol.protocol &&
        item.product.includes(ProductHubProductType.Multiply),
    )

    if (foundItem) data.push(foundItem)
  })

  return data.map((item) => ({
    maxMultiply: item.maxMultiply ? Number(item.maxMultiply) : undefined,
    collateralToken: item.primaryToken,
    debtToken: item.secondaryToken,
    protocol: item.protocol,
    network: item.network,
  }))
}
