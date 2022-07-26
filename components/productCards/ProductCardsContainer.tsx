import React from 'react'

import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { ProductCardData } from '../../helpers/productCards'
import { useAppContext } from '../AppContextProvider'
import { ProductCardBorrow } from './ProductCardBorrow'
import { ProductCardEarn } from './ProductCardEarn'
import { ProductCardMultiply } from './ProductCardMultiply'
import { ProductCardsLoader, ProductCardsWrapper } from './ProductCardsWrapper'

type ProductCardsContainerProps = {
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  ilks: string[]
  paraText?: JSX.Element
}

function ProductCardsContainer(props: ProductCardsContainerProps) {
  const ProductCard = props.renderProductCard

  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(productCardsData$(props.ilks))

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator value={[productCardsData]} customLoader={<ProductCardsLoader />}>
        {([_productCardsData]) => (
          <ProductCardsWrapper>
            {_productCardsData.map((cardData) => (
              <ProductCard cardData={cardData} key={cardData.ilk} />
            ))}
          </ProductCardsWrapper>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

type ProductSpecificContainerProps = {
  ilks: string[]
}

// we need these wrappers to avoid react trying to render the wrong card types for the wrong ilks
export function BorrowProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardBorrow} {...props} />
}

export function MultiplyProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardMultiply} {...props} />
}

export function EarnProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardEarn} {...props} />
}
