import { PromoCard } from 'components/PromoCard'
import type { PromoCardProps } from 'components/PromoCard.types'
import type { FC, ReactNode } from 'react'
import React from 'react'
import { Grid, Heading } from 'theme-ui'

interface ProductHubPromoCardsListProps {
  heading?: ReactNode
  promoCards: PromoCardProps[]
}

export const ProductHubPromoCardsList: FC<ProductHubPromoCardsListProps> = ({
  heading,
  promoCards,
}) => {
  return (
    <>
      {heading && (
        <Heading
          as="h3"
          variant="paragraph3"
          sx={{ display: 'flex', alignItems: 'center', mt: 4, fontWeight: 'semiBold' }}
        >
          {heading}
        </Heading>
      )}
      <Grid columns={[1, null, 2, 3]} gap={3} sx={{ mt: heading ? 3 : 4, mb: 4 }}>
        {promoCards.map((promoCard, i) => (
          <PromoCard key={`${promoCard.title}-${i}`} {...promoCard} />
        ))}
      </Grid>
    </>
  )
}
