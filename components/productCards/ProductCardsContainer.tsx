import { getTokens } from 'blockchain/tokensMetadata'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { ProductCardData } from '../../helpers/productCards'
import { useAppContext } from '../AppContextProvider'
import { ProductCardBorrow } from './ProductCardBorrow'
import { ProductCardEarnAave } from './ProductCardEarnAave'
import { ProductCardEarnMaker } from './ProductCardEarnMaker'
import { ProductCardMultiply } from './ProductCardMultiply'
import { ProductCardsLoader, ProductCardsWrapper } from './ProductCardsWrapper'

type StrategyTypes = {
  maker: string[]
  aave: string[]
}

type ProductCardsContainerProps = {
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  strategies: StrategyTypes
  paraText?: JSX.Element
}

function ProductCardsContainer(props: ProductCardsContainerProps) {
  const showAaveStETHETHProductCard = useFeatureToggle('ShowAaveStETHETHProductCard')
  const ProductCard = props.renderProductCard

  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(
    productCardsData$(props.strategies.maker),
  )

  const aaveStrategyCards = getTokens(props.strategies.aave)

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator value={[productCardsData]} customLoader={<ProductCardsLoader />}>
        {([_productCardsData]) => (
          <ProductCardsWrapper>
            {_productCardsData.map((cardData) => (
              <ProductCard cardData={cardData} key={cardData.ilk} />
            ))}
            {showAaveStETHETHProductCard &&
              aaveStrategyCards.map((tokenData) => (
                <ProductCardEarnAave
                  cardData={tokenData}
                  key={`ProductCardEarnAave_${tokenData.symbol}`}
                />
              ))}
          </ProductCardsWrapper>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

type ProductSpecificContainerProps = {
  strategies: StrategyTypes
}

// we need these wrappers to avoid react trying to render the wrong card types for the wrong ilks
export function BorrowProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardBorrow} {...props} />
}

export function MultiplyProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardMultiply} {...props} />
}

export function EarnProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardEarnMaker} {...props} />
}
