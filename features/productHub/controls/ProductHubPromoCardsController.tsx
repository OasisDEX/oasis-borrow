import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import type { ProductHubProductType, ProductHubPromoCards } from 'features/productHub/types'
import type { FC, ReactNode } from 'react'
import React, { useMemo } from 'react'

interface ProductHubPromoCardsControllerProps {
  heading?: ReactNode
  promoCardsData: ProductHubPromoCards
  selectedProduct: ProductHubProductType
  selectedToken: string
}

export const ProductHubPromoCardsController: FC<ProductHubPromoCardsControllerProps> = ({
  heading,
  promoCardsData,
  selectedProduct,
  selectedToken,
}) => {
  const promoCards = useMemo(
    () =>
      Object.keys(promoCardsData[selectedProduct].tokens).includes(selectedToken)
        ? promoCardsData[selectedProduct].tokens[selectedToken]
        : promoCardsData[selectedProduct].default,
    [promoCardsData, selectedProduct, selectedToken],
  )

  return (
    <>
      {promoCards.length > 0 && (
        <ProductHubPromoCardsList heading={heading} promoCards={promoCards} />
      )}
    </>
  )
}
