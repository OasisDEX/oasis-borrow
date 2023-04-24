import { getTokens } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ProductCardEarnDsr } from 'components/productCards/ProductCardEarnDsr'
import { getAaveStrategy } from 'features/aave/strategyConfig'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { ProductCardData } from 'helpers/productCards'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { ProductCardBorrow } from './ProductCardBorrow'
import { ProductCardBorrowAave } from './ProductCardBorrowAave'
import { ProductCardEarnAave } from './ProductCardEarnAave'
import { ProductCardEarnMaker } from './ProductCardEarnMaker'
import { ProductCardMultiplyAave } from './ProductCardMultiplyAave'
import { ProductCardMultiplyMaker } from './ProductCardMultiplyMaker'
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
  const ProductCard = props.renderProductCard
  const daiSavingsRate = useFeatureToggle('DaiSavingsRate')

  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(
    productCardsData$(props.strategies.maker),
  )

  const aaveStrategyCards = getTokens(props.strategies.aave ?? [])

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator value={[productCardsData]} customLoader={<ProductCardsLoader />}>
        {([_productCardsData]) => (
          <ProductCardsWrapper>
            {aaveStrategyCards.map((tokenData) => {
              const aaveStrategy = getAaveStrategy(tokenData.symbol)[0]
              switch (aaveStrategy.type) {
                case 'Borrow':
                  return (
                    <ProductCardBorrowAave
                      cardData={tokenData}
                      key={`ProductCardBorrowAave_${tokenData.symbol}`}
                    />
                  )
                case 'Multiply':
                  return (
                    <ProductCardMultiplyAave
                      cardData={tokenData}
                      key={`ProductCardMultiplyAave_${tokenData.symbol}`}
                    />
                  )
                case 'Earn':
                  return (
                    <ProductCardEarnAave
                      cardData={tokenData}
                      key={`ProductCardEarnAave_${tokenData.symbol}`}
                      strategy={aaveStrategy}
                    />
                  )
                default:
                  return null
              }
            })}
            {/* TODO prepare proper handling for DSR */}
            {props.strategies.maker.includes('DSR') && daiSavingsRate ? (
              <ProductCardEarnDsr />
            ) : null}
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
  strategies: StrategyTypes
}

// we need these wrappers to avoid react trying to render the wrong card types for the wrong ilks
export function BorrowProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardBorrow} {...props} />
}

export function MultiplyProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardMultiplyMaker} {...props} />
}

export function EarnProductCardsContainer(props: ProductSpecificContainerProps) {
  return <ProductCardsContainer renderProductCard={ProductCardEarnMaker} {...props} />
}
