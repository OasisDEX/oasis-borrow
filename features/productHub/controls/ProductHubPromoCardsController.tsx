import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import type { ProductHubProductType, ProductHubPromoCards } from 'features/productHub/types'
import type { FC, ReactNode } from 'react'
import React from 'react'

interface ProductHubPromoCardsControllerProps {
  heading?: ReactNode
  promoCardsData: ProductHubPromoCards
  selectedProduct: ProductHubProductType
}

export const ProductHubPromoCardsController: FC<ProductHubPromoCardsControllerProps> = ({
  heading,
  promoCardsData,
  selectedProduct,
}) => {
  return (
    <ProductHubPromoCardsList
      heading={heading}
      promoCards={promoCardsData[selectedProduct].default}
    />
  )
}
