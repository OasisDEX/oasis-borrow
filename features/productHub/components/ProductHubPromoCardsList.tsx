import { PromoCard } from 'components/PromoCard'
import type { PromoCardProps } from 'components/PromoCard.types'
import type { FC } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

interface ProductHubPromoCardsListProps {
  promoCards: PromoCardProps[]
}

export const ProductHubPromoCardsList: FC<ProductHubPromoCardsListProps> = ({ promoCards }) => {
  return (
    <Grid columns={[1, null, 2, 3]} gap={3} sx={{ my: 4 }}>
      {promoCards.map((promoCard, i) => (
        <PromoCard key={`${promoCard.title}-${i}`} {...promoCard} />
      ))}
    </Grid>
  )
}
