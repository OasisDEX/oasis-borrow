import React, { ReactNodeArray } from 'react'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'

interface AjnaProductCardsWrapperProps {
  children: ReactNodeArray
}

export const AjnaProductCardsWrapper = ({ children }: AjnaProductCardsWrapperProps) => (
  <ProductCardsWrapper sx={{ mt: [2, '48px'], gap: ['88px', 3, 3] }}>
    {children}
  </ProductCardsWrapper>
)
