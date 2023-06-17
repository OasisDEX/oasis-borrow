import { PromoCard } from 'components/PromoCard'
import { ProductHubProductType, ProductHubPromoCards } from 'features/productHub/types'
import React, { FC, useMemo } from 'react'
import { Grid } from 'theme-ui'

interface ProductHubPromoCardsControllerProps {
  promoCardsData: ProductHubPromoCards
  selectedProduct: ProductHubProductType
  selectedToken: string
}

export const ProductHubPromoCardsController: FC<ProductHubPromoCardsControllerProps> = ({
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
    <Grid columns={[1, null, 2, 3]} gap={3} sx={{ mb: 4 }}>
      {promoCards.map((promoCard, i) => (
        <PromoCard key={`${selectedProduct}-${i}`} {...promoCard} />
      ))}
    </Grid>
  )
}
